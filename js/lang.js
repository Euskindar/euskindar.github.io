// Conmutador ES/EN: actualiza textos, atributos y aria-pressed.
(function () {
  var root = document.documentElement;
  var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-lang-btn]'));

  var labels = {
    es: {
      group: 'Idioma',
      theme: 'Tema',
      skip: 'Saltar al contenido',
      rail: 'Hoja de ruta'
    },
    en: {
      group: 'Language',
      theme: 'Theme',
      skip: 'Skip to content',
      rail: 'Roadmap'
    }
  };

  // Etiqueta el grupo solo si existe: evita romper el idioma si cambia el markup.
  function label(selector, text) {
    var node = document.querySelector(selector);
    if (node) node.setAttribute('aria-label', text);
  }

  function apply(lang) {
    root.lang = lang;
    root.dataset.lang = lang;

    buttons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.langBtn === lang));
    });

    label('.lang', labels[lang].group);
    label('.theme', labels[lang].theme);
    label('.skip', labels[lang].skip);
    label('.rail', labels[lang].rail);
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var lang = button.dataset.langBtn;
      apply(lang);
      try {
        localStorage.setItem('euskindar-lang', lang);
      } catch (error) {
        /* almacenamiento bloqueado: el cambio sigue aplicándose en la sesión */
      }
      try {
        var url = new URL(window.location.href);
        url.searchParams.set('lang', lang);
        history.replaceState(null, '', url);
      } catch (error) {
        /* URL no disponible: se mantiene el estado en memoria */
      }
    });
  });

  apply(root.lang === 'en' ? 'en' : 'es');
})();
