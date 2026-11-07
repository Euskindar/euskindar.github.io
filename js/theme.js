// Conmutador de tema: escribe data-theme en <html>, persiste la elección y
// sincroniza aria-pressed y el meta theme-color. El pre-pintado vive en boot.js.
(function () {
  var root = document.documentElement;
  var buttons = Array.prototype.slice.call(
    document.querySelectorAll('[data-theme-btn]')
  );
  if (!buttons.length) return;

  var shared = window.EuskindarTheme || {};
  var key = shared.key || 'euskindar-theme';
  var colors = shared.colors || { light: '#f7f6f2', dark: '#161712' };

  function apply(theme) {
    root.dataset.theme = theme;

    buttons.forEach(function (button) {
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.themeBtn === theme)
      );
    });

    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) {
      metas[i].setAttribute('content', colors[theme]);
    }
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var theme = button.dataset.themeBtn === 'dark' ? 'dark' : 'light';
      apply(theme);

      try {
        localStorage.setItem(key, theme);
      } catch (error) {
        /* almacenamiento bloqueado: el cambio sigue aplicándose en la sesión */
      }

      try {
        var url = new URL(window.location.href);
        url.searchParams.set('theme', theme);
        history.replaceState(null, '', url);
      } catch (error) {
        /* URL no disponible: se mantiene el estado en memoria */
      }
    });
  });

  apply(root.dataset.theme === 'dark' ? 'dark' : 'light');
})();
