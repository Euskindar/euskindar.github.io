// Conmutador ES/EN: un solo interruptor que alterna el idioma y etiqueta los
// bloques que dependen de él.
(function () {
  var root = document.documentElement;
  var toggle = document.querySelector('[data-lang-toggle]');

  var labels = {
    es: {
      skip: 'Saltar al contenido',
      rail: 'Hoja de ruta'
    },
    en: {
      skip: 'Skip to content',
      rail: 'Roadmap'
    }
  };

  // Etiqueta el nodo solo si existe: evita romper el idioma si cambia el markup.
  function label(selector, text) {
    var node = document.querySelector(selector);
    if (node) node.setAttribute('aria-label', text);
  }

  function apply(lang) {
    root.lang = lang;
    root.dataset.lang = lang;

    label('.skip', labels[lang].skip);
    label('.rail', labels[lang].rail);
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var lang = root.dataset.lang === 'en' ? 'es' : 'en';
      apply(lang);

      try {
        localStorage.setItem('euskindar-lang', lang);
      } catch (error) {
        /* almacenamiento bloqueado: el cambio sigue aplicándose en la sesión */
      }
    });
  }

  apply(root.dataset.lang === 'en' ? 'en' : 'es');
})();
