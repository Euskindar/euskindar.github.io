# euskindar.github.io

Página provisional de [euskindar.github.io](https://euskindar.github.io/) mientras el portfolio está en construcción.

Sitio estático, sin build ni dependencias: un `index.html`, un `index.css`, las fuentes autoalojadas y un favicon SVG. GitHub Pages lo publica directamente desde `main` en la raíz.

## Contenido

- Mensaje bilingüe ES/EN con conmutador (`ES` / `EN`), persistido en `localStorage` y sobreescribible con `?lang=es` o `?lang=en`.
- Tema claro/oscuro con conmutador (`☀` / `☾`). Por defecto sigue al sistema (`prefers-color-scheme`), se persiste en `localStorage` y se puede forzar con `?theme=light` o `?theme=dark`. Sin JS, el CSS sigue al sistema igualmente.
- Hoja de ruta mínima en forma de grafo de commits: `init`, `contenido`, `portfolio`, `contacto`.
- Acciones: email y GitHub. Sin fechas ni proyectos inventados.
- `noindex, nofollow` hasta que llegue el portfolio real.

## Ver en local

Cualquier servidor estático sirve:

```bash
python3 -m http.server 8000
# http://localhost:8000/
```

No uses `file://`: el preload de fuentes y `localStorage` pueden comportarse distinto.

## Publicar

```bash
git add .
git commit -m "feat: holding page"
git push origin main
```

GitHub Pages está configurado en `main` / raíz con HTTPS forzado, así que el cambio se publica en uno o dos minutos.

## Estructura

```text
.
├── index.html
├── index.css
├── favicon.svg
├── js/
│   ├── boot.js          # idioma y tema antes del primer pintado
│   ├── lang.js          # conmutador ES/EN (localStorage y ?lang=)
│   ├── theme.js         # conmutador claro/oscuro (localStorage y ?theme=)
│   └── crane.js         # geometría de la grúa y del titular suspendido
├── fonts/
│   ├── archivo-400-800-latin{,-ext}.woff2
│   └── azeret-mono-{400,500}-latin{,-ext}.woff2
├── PRODUCT.md
└── docs/
```

`PRODUCT.md` y `docs/` describen el proyecto; no son necesarios para servir la página.

## Licencias

- Código y contenido: © Euskindar.
- Archivo y Azeret Mono: SIL Open Font License 1.1.
