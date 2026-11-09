# Museos del Perú

Prototipo de exploración cultural creado a partir del proyecto original de Figma Make. React + TypeScript + Vite + Tailwind CSS + MapLibre GL JS. No necesita backend, cuenta de mapas ni clave de API.

## Explora Puno · versión local

Ejecutar **`npm run dev`** y abrir **`http://127.0.0.1:5173/?seccion=puno`**. Desarrollo y producción usan exactamente la misma selección: **32 fichas con dos fotografías, 64 en total**. Cancha Cancha conserva los dos adjuntos solicitados, con marcas y crédito. Los pies y el visor muestran créditos compactos. `npm run dev:revision` sigue disponible en el puerto 5174 con los mismos datos.

Las variantes web seleccionadas están en `public/images/puno` y sus datos en `src/puno-content.json`. La procedencia, créditos, modificaciones y estados reales de autorización se conservan también en `public/puno-photo-evidence.json`. El responsable del sitio decidió expresamente publicar esta selección: **61 fotografías mantienen autorización pendiente y tres tienen licencia documentada**. Esa decisión no concede derechos de los autores ni convierte las fotografías pendientes en licenciadas. No hay filtros por autorización ni sustituciones distintas según el modo de ejecución.

En la rama `patrimonio-puno` se incorpora un acceso «Explora Puno» en la navegación. Abre `http://localhost:5173/?seccion=puno` después de ejecutar `npm run dev`. Las provincias y fichas conservan su ruta en la URL; para probar una ficha completa, usa `?seccion=puno&provincia=2108&lugar=tinajani` o `?seccion=puno&provincia=2101&lugar=inka-uyu`.

Incluye 13 provincias, selector accesible y 32 fichas respaldadas en 11 provincias, más cinco formaciones agrupadas en Tinajani. Lampa tiene cuatro lugares, con fichas independientes para las réplicas y para la capilla y el osario. Las listas no llevan fotografías. Moho y Yunguyo no reciben lugares ajenos al PDF. La documentación privada, el PDF original, ZIP, capturas y temporales se conservan solo localmente, excluidos de Git y del despliegue. La instalación, desarrollo, pruebas y compilación no dependen de esos archivos.

El mapa provincial utiliza MapLibre con terreno sombreado, agua y límites reales simplificados en conjunto para conservar bordes compartidos. Reutiliza los servicios del proyecto y requiere internet y WebGL2; conserva el selector accesible si falla la cartografía. `src/puno-content.json` y `public/maps/puno-provinces.geojson` contienen exclusivamente la información pública necesaria; las imágenes preparadas están en `public/images/puno`. No se copia `documentacion/` al sitio. El estilo y las vistas del mapa nacional no se modifican.

El diseño conserva distribución 70/30, mapa restringido a Puno, blanco piedra, filas compactas, fotos a proporción natural y visor centrado de pantalla completa.

`scripts/prepare-puno-selection.mjs` es una herramienta editorial opcional para importar los recursos elegidos desde el archivo privado conservando sus metadatos. No forma parte de `npm test`, `npm run check` ni `npm run build`. El generador histórico `prepare-puno.py` no debe utilizarse para restablecer selecciones anteriores.

## Abrir en Windows / VS Code

1. Descomprime todo el ZIP.
2. Instala Node.js 24 LTS si todavía no lo tienes.
3. Abre la carpeta `Museos_del_Peru` en VS Code.
4. En la terminal ejecuta:

```bash
npm install
npm run dev
```

Abre la dirección que muestra Vite, normalmente `http://localhost:5173`. También puedes ejecutar `iniciar.bat` en Windows; instala las dependencias si faltan e inicia Vite. No abras `index.html` con doble clic: la aplicación necesita un servidor local.

Para instalar exactamente las versiones del lockfile, usa pnpm 11 y `pnpm install --frozen-lockfile`.

## Compilar y desplegar

```bash
npm run build
npm run preview
```

La carpeta `dist` contiene la versión compilada y se excluye de Git. Es la carpeta que publica el alojamiento estático. `netlify.toml` configura `npm run build`, Node 24 y el directorio `dist`.

## Qué incluye esta revisión · 28 de octubre de 2026

- Portada fotográfica a pantalla completa con cuatro imágenes reales: Chavín, Sipán, Pukara y Cao. Cambio cada ocho segundos, botones anterior/siguiente, selección directa y pausa. El cambio automático se detiene al interactuar, salir de la portada, cambiar de pestaña o activar movimiento reducido.
- Mapa con **Relieve 3D y Plano**. Se eliminó la opción «Mapa local» y su imagen de relieve alternativa.
- Buscador con botón Buscar y Enter; sugerencias, contador inmediato, mensaje sin coincidencias y filtros que se pueden quitar individualmente. La búsqueda ignora tildes y mayúsculas, combina palabras en cualquier orden y consulta nombre, ciudad, región, tipo y temas documentados.
- Directorio original de **66 museos y espacios** en los **24 departamentos y Callao**. Orden A–Z / Z–A y carga progresiva.
- Las **66 fichas** tienen fotografías reales, descripción, piezas o aspectos destacados, temas y fuentes. Se incluye historia institucional cuando la documentación permite respaldarla. La ficha enlaza a información institucional incluso si no hay recorrido.
- **29 museos con recorrido virtual enlazado**, frente a seis en la versión previa. Hay 33 recursos específicos entre 30 museos: recorridos, colecciones, video y audioguía. Cao se identifica como recorrido parcial (salas 6 y 7 y espacios del complejo). Los otros museos mantienen su ficha documental, sin inventar recorridos.
- Diálogos nativos con cierre por Escape, foco contenido y restaurado; adaptación a celular; textos legibles, tipografías locales y fotos WebP. Los filtros se guardan en la URL.

## Mapa y conexión

MapLibre muestra cartografía de OpenFreeMap y elevaciones reales de Mapterhorn. Incluye relieve, sombras, inclinación, acercamiento a la región y vista plana. **Ambas vistas requieren internet y WebGL2.** Los límites departamentales y el estilo se empaquetan localmente; las capas cartográficas, glifos y elevaciones proceden de servicios externos.

La exageración vertical es 1,4. No hay marcadores de museos con coordenadas inferidas. Google Maps abre una búsqueda por nombre y dirección, no un punto geográfico certificado.

Si el navegador no puede iniciar el mapa o no completa su carga en 22 segundos, se muestra un aviso, un botón para reintentar y un selector accesible de las 25 regiones. El directorio sigue disponible. Esta pantalla no se presenta como un mapa alternativo.

Se conserva la corrección del contenedor MapLibre: dimensiones explícitas, selector CSS más específico, observación del tamaño y reajuste al volver desde el directorio. La prueba manual `scripts/qa-map-layout.html` comprueba la altura incluso cuando la hoja de MapLibre se carga después.

## Editar y ampliar

- `src/data.ts`: catálogo inicial, tipos de datos, territorios y combinación de los archivos de enriquecimiento.
- `src/enrichment.ts`: seis fichas previas, fotografías y correcciones de ubicación conservadas.
- `src/museum-content.ts`: descripciones, historias, destacados, temas y fuentes de las 66 fichas.
- `src/museum-resources.ts`: recursos por museo, tipo, alcance, fuente y fecha de revisión. `virtualUrl` se obtiene del primer recurso de tipo `tour` para mantener compatibles tarjetas y filtros.
- `src/photo-enrichment.ts`: fotografías adicionales con autor, procedencia y condiciones de uso.
- `public/resource-audit.json`: los 66 registros y los recursos encontrados, con método y límites de verificación.
- `public/photo-evidence.json` y `public/image-credits.json`: trazabilidad y créditos fotográficos.
- `src/catalog.ts`: búsquedas, filtros, orden y enlaces de Maps.
- `src/components/HeroCarousel.tsx`: portada y controles de fotografías.
- `src/components/PeruMap.tsx`: mapa y recuperación accesible.
- `src/components/DetailModal.tsx`: ficha, contenido documental, recursos y créditos.
- `src/App.tsx`: composición y estado compartido.
- `src/index.css`, `src/exhibition.css`, `src/fonts.css`: estilos adaptables y fuentes locales.

Los archivos de contenido y recursos usan el nombre exacto del museo como clave. Para añadir un registro, utiliza un nombre único, departamento válido y fuente de ubicación. Añade sólo datos e imágenes documentados. Los recursos aceptan `tour`, `collection`, `video`, `audio` y `guide`: no etiquetar un video o una guía como visita 360°. Documenta si el recorrido sólo muestra algunas salas o una exposición anterior.

## Comprobaciones

```bash
npm run check
npm test
npm run build
```

- TypeScript y compilación de producción comprobados.
- 18 pruebas: nueve del catálogo nacional, seis de datos y navegación de Puno y tres de integración de la revisión local. Sin la documentación privada pasan 17 y se omite explícitamente solo la prueba de sus galerías opcionales. TypeScript y build funcionan sin esa carpeta y generan los mismos archivos.
- Revisión en navegador de escritorio y vista móvil embebida de 390 × 844: portada, selección de imágenes, menú, búsqueda con botón/Enter, resultados vacíos, recorridos, filtros, fichas, Escape y ausencia de desbordamiento horizontal.
- Se comprobó la selección de Callao en la recuperación accesible y la ausencia de «Mapa local».
- En la revisión final local con Chrome se comprobaron el mapa nacional y sus controles Plano / Relieve 3D. El mapa provincial se verificó en escritorio y móvil, con acceso a las 13 provincias, distribución 70/30 en escritorio, restricciones regionales y reencuadre al cambiar de tamaño.

## Alcance de la información y los enlaces

La base es una muestra inicial, no un inventario nacional completo. Las reseñas se sintetizaron de la Guía de museos 2023 y fuentes institucionales, con enlaces a páginas exactas cuando corresponden. No certifican el estado actual de una exposición. Las direcciones proceden de publicaciones de distintas fechas; en Pukara se conserva la corrección documentada a Jr. Lima s/n. No se infieren tarifas, horarios ni estado de apertura.

Se cruzaron los 66 registros con el listado público de Visita Virtual del Ministerio de Cultura y se consultaron fuentes complementarias oficiales de El Brujo, JNE y MUCEN. Los 27 enlaces ministeriales y el del JNE respondieron HTTP 200 y se identificó su visor en el HTML; algunos necesitaron un segundo intento por respuestas 503 temporales. Esto **no prueba la navegación completa de todas las salas**. El LUM se abrió en el navegador y se comprobó su presentación y panorama inicial. El JNE usa Unity WebGL. El Brujo publica el recorrido parcial, el video y el catálogo en su web oficial.

Los enlaces del MUCEN están documentados en fuentes oficiales, pero su protección antibots impidió comprobar el catálogo y reproducir la audioguía en esta revisión. Esta limitación queda registrada en la auditoría; no se certifica que esos recursos se hayan probado por completo. No encontrar un recorrido en las fuentes revisadas no significa que no exista.

Las 66 fotografías muestran edificios, salas o piezas reales y tienen fechas distintas. Muchas de las procedentes de la guía tienen entre 325 y 670 px de ancho, por lo que su ampliación tiene detalle limitado. En la ficha se muestra el encuadre completo. La portada usa sólo fotografías con licencias Creative Commons. No se usan imágenes generadas con IA como fotografías de los museos.

## Créditos

Fotografías: siete de Wikimedia Commons (cinco CC BY-SA 4.0, Pukara CC BY-SA 2.0 y Cao CC BY 2.0); 59 extraídas de las fichas correspondientes de la Guía de Museos e Instituciones Museales del Perú 2023, con crédito general al Ministerio de Cultura y museos participantes. Estas últimas se identifican como derechos reservados, no como contenido de licencia abierta. Antes de una publicación pública, resolver las autorizaciones de reproducción aplicables o sustituirlas por fotos propias o con licencia abierta. Detalle por museo, enlace a página exacta, crédito y transformaciones en `public/image-credits.json` y `public/photo-evidence.json`.

Fuentes tipográficas: Cinzel, Cormorant Garamond y Source Sans 3, SIL OFL, archivos de licencia en `public/fonts`.

Cartografía: OpenFreeMap / OpenMapTiles / OpenStreetMap; Natural Earth; Mapterhorn y sus fuentes abiertas de elevación (https://mapterhorn.com/attribution/). Polígonos simplificados heredados del prototipo: https://github.com/juaneladio/peru-geojson. Son adecuados para exploración cultural, no para delimitación legal. Se mantienen atribuciones visibles. Los servicios externos conservan sus propias condiciones y disponibilidad.

## Referencias de diseño

Rijksmuseum (https://www.rijksmuseum.nl/en): escala tipográfica, fotografía protagonista y jerarquía de navegación. Museo Larco (https://www.museolarco.org/): colección y contexto patrimonial. Son referencias de composición; no se copiaron imágenes ni marcas de estas páginas. Cinzel es una tipografía contemporánea inspirada en inscripciones clásicas; no se presenta como escritura prehispánica. El friso escalonado es una composición decorativa original, sin atribuirlo a una cultura específica.
