
# Mapa de Elementos para Edición

Utilice los siguientes selectores CSS para identificar y modificar secciones del sitio.

## General
- **Navegación Principal**: `.navbar`
- **Logo**: `.navbar-brand`
- **Menú Items**: `.nav-link`
- **Footer**: `.footer`
- **Botones Primarios**: `.btn-primary`
- **Botones Secundarios**: `.btn-outline`

## Home (`index.html`)
1. **Hero Section (Slider)**: `.hero`
   - Título Principal: `.hero-title`
   - Subtítulo: `.hero-subtitle`
   - Botones Hero: `.hero-btn-wrapper`
2. **Sección Híbrida (Tienda vs A Medida)**: `.section` (primera sección)
   - Título: `.section-title`
   - Tarjeta Tienda: `.hybrid-cta-card` (primera)
   - Tarjeta A Medida: `.hybrid-cta-card` (segunda)
3. **Productos Destacados**: `.products-grid`
   - Tarjeta Producto: `.product-card`
   - Precio: `.product-price`
   - Botón Comprar: `.btn-add-cart`

## Tienda (`tienda.html`)
- **Filtros**: `.filters-container` (si existe) o `.category-filter`
- **Grilla de Productos**: `.products-grid`
- **Barra de Búsqueda**: `#search-input`

## Contacto (`contacto.html`)
- **Formulario**: `.contact-form`
- **Campos**: `.form-control`
- **Botón Enviar**: `.btn-submit`
- **Datos de Contacto**: `.contact-info`

## Estilos Globales (`css/styles.css`)
- **Colores Principales**: Busque variables CSS como `--color-primary`, `--color-secondary` en `:root`.
- **Tipografía**: `--font-family-base`, `--font-family-heading`.

## Instrucciones
Para modificar un texto o estilo:
1. Identifique el archivo HTML correspondiente.
2. Busque el texto o la clase CSS mencionada arriba.
3. Realice el cambio y guarde.
4. Si es un cambio de estilo, edite `css/styles.css`.
