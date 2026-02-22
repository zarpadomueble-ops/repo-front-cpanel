# Migración de Assets y Rutas (2026-02-21)

## Objetivo aplicado
- Todos los recursos de imagen/icono referenciados en HTML/CSS/JS quedaron apuntando a `/Assets/` (A mayúscula).
- Se normalizó navegación con rutas limpias (sin `.html`) para evitar 404 internos.
- Se actualizó `.htaccess` para Apache/LiteSpeed con rewrite seguro de rutas limpias.

## Estrategia de rutas elegida
- Opción B: rutas limpias.
- Ejemplos:
  - `/tienda` -> sirve `tienda.html`
  - `/a-medida` -> sirve `a-medida.html`
  - `/pages/tienda` (legacy) -> `/tienda`

## Inventario (resumen)
### HTML detectados
- `404.html`
- `a-medida.html`
- `admin-finanzas/index.html`
- `admin-finanzas/login.html`
- `catalogo.html`
- `confirmacion.html`
- `contacto.html`
- `datos-envio.html`
- `envios.html`
- `estado-pedido.html`
- `failure.html`
- `garantia.html`
- `gracias.html`
- `index.html`
- `nosotros.html`
- `panel-interno.html`
- `partials/footer.html`
- `partials/header.html`
- `pending.html`
- `privacidad.html`
- `reembolso.html`
- `servicios.html`
- `success.html`
- `terminos.html`
- `tienda-cocinas.html`
- `tienda-comedor.html`
- `tienda-escritorios.html`
- `tienda-living.html`
- `tienda-placards.html`
- `tienda.html`

### CSS detectados
- `admin-finanzas/styles.css`
- `css/styles.css`

### JS detectados
- `admin-finanzas/api.js`
- `admin-finanzas/app.js`
- `admin-finanzas/charts.js`
- `admin-finanzas/login.js`
- `admin-finanzas/ui/categories.js`
- `admin-finanzas/ui/customers.js`
- `admin-finanzas/ui/dashboard.js`
- `admin-finanzas/ui/import-export.js`
- `admin-finanzas/ui/transactions.js`
- `js/admin-panel.js`
- `js/clear-cart-on-success.js`
- `js/confirmacion.js`
- `js/datos-envio.js`
- `js/estado-pedido.js`
- `js/logo-theme.js`
- `js/runtime-config.js`
- `js/script.js`
- `js/site-shell.js`

### Carpeta `/Assets/`
- `Assets/favicon/*`
- `Assets/optimized/desktop-16x9/*`
- `Assets/optimized/mobile-9x16/*`
- `Assets/optimized/optimization-report.csv`

## Mapeo de referencias (reglas aplicadas)
- `assets/...` y `/assets/...` -> `Assets/...` y `/Assets/...`.
- Íconos/favicons -> `/Assets/favicon/*`.
- Imágenes de producto/hero -> `/Assets/optimized/desktop-16x9/*` y/o `/Assets/optimized/mobile-9x16/*`.
- Enlaces internos `/*.html` -> `/<slug>` (rutas limpias), excepto flujo interno de `admin-finanzas` que conserva su esquema local (`./login.html`, `./index.html`).

## Ejemplos de antes vs después
- `/assets/favicon/favicon.ico` -> `/Assets/favicon/favicon.ico`
- `/assets/optimized/...` -> `/Assets/optimized/...`
- `/tienda.html` -> `/tienda`
- `/a-medida.html` -> `/a-medida`
- `/contacto.html` -> `/contacto`

## Excepciones reportadas
- Los archivos de código (`/css/*.css`, `/js/*.js`, `/admin-finanzas/*.js`) no se movieron a `/Assets/` porque no son assets de imagen optimizables y moverlos rompería carga/estructura actual.
- Varios nombres legacy de imágenes originales ya no estaban disponibles; se remapearon a equivalentes existentes en `/Assets/optimized/*` para evitar roturas.

## `.htaccess` aplicado
Archivo: `.htaccess`

Reglas clave:
- Si archivo/carpeta existe: no reescribe.
- Compatibilidad legacy `/pages/*`.
- Reescritura de ruta limpia `/<slug>` a `/<slug>.html` solo si el `.html` existe.
- Preserva query strings (`QSA`).

## Validaciones ejecutadas
- `rg` sobre HTML/CSS/JS para confirmar:
  - Sin referencias a `/assets/` en minúscula.
  - Sin `href="/...html"` en HTML público.
- `node --check` sobre JS principal: sin errores de sintaxis.
- Script de validación de referencias locales (HTML/CSS): `missing_local_refs 0`.
- Script de validación de rutas de imagen en JS: `js_image_missing 0`.
- Script de verificación de imágenes fuera de `/Assets/`: `non_assets_image_refs 0`.

## Limpieza sugerida (sin borrar automáticamente)
- Existe duplicación física entre carpetas `assets/` y `Assets/`.
- Hay archivos en `/Assets/` no referenciados actualmente (59 detectados), principalmente variantes mobile/favicons alternativos.
- Recomendación:
  1. Definir carpeta canónica única (`Assets/`).
  2. Respaldar.
  3. Eliminar duplicados/no usados en una tarea separada con validación visual final.
