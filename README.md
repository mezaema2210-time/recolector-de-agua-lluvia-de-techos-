# Recolector de agua lluvia para vivienda — Modelo 3D

Sitio web académico interactivo hecho con HTML, CSS, JavaScript y Three.js.

## Archivos
- `index.html`: estructura y textos de la página.
- `styles.css`: diseño visual adaptable a celular y computador.
- `app.js`: modelo 3D, controles, animación y cálculos demostrativos.

## Cómo probarlo en tu computador
1. Descarga y descomprime la carpeta.
2. Abre la carpeta en Visual Studio Code.
3. Instala la extensión **Live Server**.
4. Haz clic derecho sobre `index.html` y selecciona **Open with Live Server**.
5. Necesitas conexión a internet para cargar Three.js desde CDN.

> No es recomendable abrir `index.html` con doble clic porque el navegador puede bloquear los módulos JavaScript.

## Publicar gratis en GitHub Pages
1. Entra a https://github.com e inicia sesión.
2. Pulsa **New repository**.
3. Escribe un nombre, por ejemplo `recolector-agua-lluvia`.
4. Selecciona **Public** y crea el repositorio.
5. Dentro del repositorio pulsa **Add file → Upload files**.
6. Sube `index.html`, `styles.css`, `app.js` y `README.md` (los archivos, no una carpeta comprimida dentro del repositorio).
7. Pulsa **Commit changes**.
8. Abre **Settings → Pages**.
9. En **Build and deployment**, selecciona **Deploy from a branch**.
10. En Branch selecciona **main** y carpeta **/(root)**. Pulsa **Save**.
11. Espera unos minutos. GitHub mostrará la dirección pública, normalmente:
   `https://TU-USUARIO.github.io/recolector-agua-lluvia/`

Cada vez que modifiques los archivos y hagas **Commit changes**, GitHub Pages actualizará el sitio.

## Cómo personalizar
- Cambiar textos: `index.html`.
- Cambiar colores y tamaños: `styles.css`.
- Cambiar geometría, materiales, etiquetas y cálculos: `app.js`.

## Alcance y advertencia
El cálculo usa `Q = C × I × A`, con `C = 0,85`, y presenta un caudal aproximado en L/min. La simulación acelera el tiempo para mostrar el llenado en una demostración. Es un modelo conceptual para aprendizaje, no un plano constructivo ni un diseño hidráulico certificado. Para construirlo se deben comprobar intensidad de lluvia local, área efectiva, pendientes, dimensiones de canal y bajante, rejillas, primera descarga, rebose, almacenamiento, mantenimiento y normativa aplicable con un profesional.
