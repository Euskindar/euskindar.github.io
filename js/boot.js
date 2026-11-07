// Pre-pintado: fija idioma y tema en <html> antes del primer render para
// evitar parpadeo. Prioridad: ?param= > localStorage > sistema.
(function () {
  var root = document.documentElement;
  var LANGS = ['es', 'en'];
  var THEMES = ['light', 'dark'];
  var COLORS = { light: '#f7f6f2', dark: '#161712' };

  var params = new URLSearchParams(window.location.search);

  function read(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null; // almacenamiento bloqueado: se usa el valor por defecto
    }
  }

  // Solo acepta valores de la lista; cualquier otra cosa cae al siguiente nivel.
  function pick(value, allowed, fallback) {
    return allowed.indexOf(value) === -1 ? fallback : value;
  }

  var browserLang =
    (navigator.language || 'es').toLowerCase().indexOf('en') === 0 ? 'en' : 'es';
  var lang =
    pick(params.get('lang'), LANGS, null) ||
    pick(read('euskindar-lang'), LANGS, null) ||
    browserLang;

  var systemTheme =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  var theme =
    pick(params.get('theme'), THEMES, null) ||
    pick(read('euskindar-theme'), THEMES, null) ||
    systemTheme;

  root.lang = lang;
  root.dataset.lang = lang;
  root.dataset.theme = theme;

  // Las dos metas declaran media queries para el caso sin JS; aquí se fijan
  // ambas al color real para que el override manual también se refleje.
  var metas = document.querySelectorAll('meta[name="theme-color"]');
  for (var i = 0; i < metas.length; i++) {
    metas[i].setAttribute('content', COLORS[theme]);
  }

  // Estado compartido con js/theme.js: una sola fuente para clave y colores.
  window.EuskindarTheme = { key: 'euskindar-theme', colors: COLORS };
})();
