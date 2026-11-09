// Conmutador de tema: un solo interruptor que alterna claro/oscuro.
// El estado inicial lo resuelve js/boot.js antes del primer pintado.
(function () {
  var root = document.documentElement;
  var toggle = document.querySelector('[data-theme-toggle]');
  if (!toggle) return;

  var shared = window.EuskindarTheme || {};
  var key = shared.key || 'euskindar-theme';
  var colors = shared.colors || { light: '#f7f6f2', dark: '#161712' };

  function apply(theme) {
    root.dataset.theme = theme;
    toggle.setAttribute('aria-checked', String(theme === 'dark'));

    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) {
      metas[i].setAttribute('content', colors[theme]);
    }
  }

  toggle.addEventListener('click', function () {
    var theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(theme);

    try {
      localStorage.setItem(key, theme);
    } catch (error) {
      /* almacenamiento bloqueado: el cambio sigue aplicándose en la sesión */
    }
  });

  apply(root.dataset.theme === 'dark' ? 'dark' : 'light');
})();
