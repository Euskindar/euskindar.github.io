// Geometría de la grúa y respuesta del péndulo al cursor.
// La carga (el titular) se dibuja sobre el tamaño real del escenario y se
// recalcula si cambia el layout.
(function () {
  var svg = document.querySelector('.blueprint');
  var stage = document.querySelector('.stage');
  var title = document.querySelector('.title');
  if (!svg || !stage || !title) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var part = function (name) {
    return svg.querySelector('[data-bp="' + name + '"]');
  };

  var line = function (el, x1, y1, x2, y2) {
    if (!el) return;
    el.setAttribute('x1', x1);
    el.setAttribute('y1', y1);
    el.setAttribute('x2', x2);
    el.setAttribute('y2', y2);
  };

  var box = function (el, x, y, w, h) {
    if (!el) return;
    el.setAttribute('x', x);
    el.setAttribute('y', y);
    el.setAttribute('width', w);
    el.setAttribute('height', h);
  };

  function draw() {
    var width = stage.clientWidth;
    var height = stage.clientHeight;
    if (!width || !height) return;

    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);

    var ground = height - 1;
    var chord = 20; // altura entre cordones de la pluma
    var topY = Math.round(height * 0.12);
    var botY = topY + chord;
    var mastRight = width - 44;
    var mastLeft = mastRight - 26;
    var apexX = (mastLeft + mastRight) / 2;
    var apexY = topY - 30;

    // Mástil sobre el lateral derecho
    line(part('mastLeft'), mastLeft, topY, mastLeft, ground);
    line(part('mastRight'), mastRight, topY, mastRight, ground);
    line(part('mastBase'), mastLeft - 12, ground, mastRight + 12, ground);
    box(part('mastLattice'), mastLeft, topY, 26, ground - topY);

    // Pluma: cruza hacia el centro; de su carro cuelga la carga
    var jibLeft = Math.round(width * 0.28);
    line(part('jibTop'), jibLeft, topY, mastRight, topY);
    line(part('jibBottom'), jibLeft, botY, mastRight, botY);
    box(part('jibLattice'), jibLeft, topY, mastRight - jibLeft, chord);

    // Contrapeso corto, cerrado hacia el borde de la página
    line(part('counterTop'), mastRight, topY, width - 6, topY);
    line(part('counterBottom'), mastRight, botY, width - 10, botY);
    box(part('counterWeight'), width - 36, topY, 30, 24);

    // Puntal sobre el mástil y tirantes a pluma y contrapeso
    part('pinnacle').setAttribute(
      'd',
      'M' + mastLeft + ' ' + topY + ' L' + apexX + ' ' + apexY + ' L' + mastRight + ' ' + topY
    );
    line(part('tieLeft'), apexX, apexY, jibLeft + (apexX - jibLeft) * 0.35, topY);
    line(part('tieRight'), apexX, apexY, width - 26, topY);

    // Carga: el titular. El aparejo se ancla a la primera línea real del
    // texto (no al rectángulo del bloque), para que las manos agarren letras
    // también cuando el titular ocupa dos líneas.
    var sRect = stage.getBoundingClientRect();
    var tRect = title.getBoundingClientRect();
    var lang = document.documentElement.dataset.lang || 'es';
    var spans = title.querySelectorAll('[data-lang-text]');
    var span = null;
    for (var i = 0; i < spans.length; i++) {
      if (spans[i].dataset.langText === lang && spans[i].offsetParent !== null) {
        span = spans[i];
        break;
      }
    }
    if (!span) return;

    var lineRect = span.getClientRects()[0];
    if (!lineRect) return;

    var cx = Math.round(lineRect.left - sRect.left + lineRect.width / 2);
    var ty = Math.round(lineRect.top - sRect.top);
    cx = Math.max(jibLeft + 14, Math.min(cx, mastLeft - 30));

    var maxSpread = mastLeft - 34 - cx; // el eslingado no cruza el mástil
    var spread = Math.max(140, Math.min(lineRect.width * 0.72, maxSpread));
    var spreaderY = ty - 18;
    var exLeft = lineRect.left - sRect.left + lineRect.width * 0.16;
    var exRight = lineRect.left - sRect.left + lineRect.width * 0.84;

    box(part('trolley'), cx - 10, botY - 3, 20, 17);
    line(part('cable'), cx, botY + 14, cx, spreaderY);
    box(part('hook'), cx - 6, spreaderY - 12, 12, 12);
    line(part('spreader'), cx - spread / 2, spreaderY, cx + spread / 2, spreaderY);
    line(part('slingLeft'), cx - spread / 2, spreaderY, exLeft, ty - 10);
    line(part('slingRight'), cx + spread / 2, spreaderY, exRight, ty - 10);
    box(part('clampLeft'), exLeft - 8, ty - 10, 16, 10);
    box(part('clampRight'), exRight - 8, ty - 10, 16, 10);

    // El balanceo pivota en el punto del carro; el titular comparte péndulo
    svg.style.setProperty('--bp-sway-x', cx + 'px');
    svg.style.setProperty('--bp-sway-y', botY + 'px');
    title.style.setProperty('--bp-sway-tx', (cx - (tRect.left - sRect.left)) + 'px');
    title.style.setProperty('--bp-sway-ty', (botY - ty) + 'px');
  }

  if (typeof ResizeObserver !== 'undefined') {
    var observer = new ResizeObserver(draw);
    observer.observe(stage);
    observer.observe(title);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(draw);
  }

  window.addEventListener('resize', draw);
  draw();

  // Péndulo controlado por JS: vaivén continuo y repulsión del cursor.
  // Sin JS la grúa no tiene geometría, así que no hay nada que degradar.
  if (reduceMotion.matches) return;

  var load = svg.querySelector('.bp-load');
  if (!load) return;

  var BASE_AMP = 2;
  var MAX_BIAS = 4.5;
  var PERIOD = 8; // segundos por ciclo completo
  var amp = BASE_AMP;
  var bias = 0;
  var phase = 0;
  var energy = 0;
  var lastX = null;
  var lastT = 0;
  // Estado del imán: posición del cursor y centro del titular.
  var near = false;
  var pointerX = 0;
  var pointerProximity = 0;
  var centerX = 0;
  var halfWidth = 1;
  var lastFrame = 0;
  var looping = false;

  var clamp = function (value, min, max) {
    return Math.max(min, Math.min(max, value));
  };

  var frame = function (now) {
    if (document.hidden) {
      looping = false;
      return;
    }

    if (!lastFrame) lastFrame = now;
    var dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;

    // El impulso del cursor se agota solo.
    energy *= 0.94;

    var targetAmp = BASE_AMP;
    var targetBias = 0;
    if (near) {
      targetAmp = BASE_AMP + (0.6 + energy * 2.6) * pointerProximity;
      // Imán: el péndulo se aparta del lado en el que está el cursor.
      // Con el pivote encima, un ángulo positivo desplaza la carga a la
      // izquierda; por eso el signo es directo (no negativo).
      targetBias =
        clamp((pointerX - centerX) / halfWidth, -1, 1) *
        MAX_BIAS *
        pointerProximity;
    }

    amp += (targetAmp - amp) * 0.12;
    bias += (targetBias - bias) * 0.12;

    phase += (dt * Math.PI * 2) / PERIOD;
    var angle = amp * Math.sin(phase) + bias;
    var transform = 'rotate(' + angle.toFixed(3) + 'deg)';
    load.style.transform = transform;
    title.style.transform = transform;

    window.requestAnimationFrame(frame);
  };

  var startLoop = function () {
    if (looping) return;
    looping = true;
    lastFrame = 0;
    window.requestAnimationFrame(frame);
  };

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      looping = false;
    } else {
      startLoop();
    }
  });

  stage.addEventListener(
    'pointermove',
    function (event) {
      var tr = title.getBoundingClientRect();
      if (!tr.width) return;

      // Distancia al rectángulo del titular: la interacción llega hasta 140px.
      var dx = Math.max(tr.left - event.clientX, 0, event.clientX - tr.right);
      var dy = Math.max(tr.top - event.clientY, 0, event.clientY - tr.bottom);
      var proximity = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 140);
      if (!proximity) {
        near = false;
        lastX = null;
        return;
      }

      near = true;
      pointerX = event.clientX;
      pointerProximity = proximity;
      centerX = tr.left + tr.width / 2;
      halfWidth = tr.width / 2 || 1;

      var now = window.performance.now();
      var speed =
        lastX === null ? 0 : Math.abs(event.clientX - lastX) / Math.max(8, now - lastT);
      lastX = event.clientX;
      lastT = now;
      energy = Math.min(1, speed / 2);
    },
    { passive: true }
  );

  stage.addEventListener(
    'pointerleave',
    function () {
      near = false;
      lastX = null;
      energy = 0;
    },
    { passive: true }
  );

  startLoop();
})();
