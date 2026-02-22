# Formularios Frontend (Formspree)

## Endpoints activos
- Contacto: `https://formspree.io/f/maqdbvdb`
- A Medida: `https://formspree.io/f/xlgwlzwp`

## Dónde están los formularios
- Contacto: `contacto.html` (`#form-contacto`)
- A Medida: `a-medida.html` (`#form-medida`)

## Cómo verificar que funciona
1. Entrar a `/contacto.html`, enviar el formulario y confirmar redirección a `/gracias.html`.
2. Entrar a `/a-medida.html`, enviar el formulario y confirmar redirección a `/gracias.html`.
3. Revisar en Formspree:
   - Email de confirmación del formulario (si es el primer envío).
   - Submissions en el panel de cada endpoint.
4. Si no llega una entrada, revisar spam y estado del formulario en Formspree (activo/verificado).

## Nota sobre adjuntos (A Medida)
- El formulario mantiene `input type="file"` con `enctype="multipart/form-data"`.
- Si el plan/configuración de Formspree no acepta adjuntos, usar el campo opcional `link_fotos`.
- Mensaje visible en el formulario: “Si las fotos no se adjuntan, pegá un link (Drive) o te contactamos por WhatsApp”.

## WP-friendly (referencia migración)
- Parciales creados:
  - `partials/header.html`
  - `partials/footer.html`
- En cada HTML se agregaron comentarios de referencia:
  - `<!-- WP: header.php aquí -->`
  - `<!-- WP: footer.php aquí -->`
