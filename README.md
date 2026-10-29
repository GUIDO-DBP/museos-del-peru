# Museos del Perú

Prototipo de exploración cultural creado a partir del proyecto original de Figma Make. React + TypeScript + Vite + Tailwind CSS + MapLibre GL JS. No necesita backend, cuenta de mapas ni clave de API.

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

La carpeta `dist` incluida contiene la versión compilada. Es la carpeta que se publica en un alojamiento estático. `netlify.toml` configura `npm run build`, Node 24 y el directorio `dist`. No se ha realizado un despliegue público ni se ha conectado una cuenta de Netlify.

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
- Nueve pruebas: 66 registros/25 territorios, tildes, filtros combinados, orden sin mutaciones, enlace Maps, geometrías, fotografías, búsqueda por palabras/temas y contenido/recursos con procedencia.
- Revisión en navegador de escritorio y vista móvil embebida de 390 × 844: portada, selección de imágenes, menú, búsqueda con botón/Enter, resultados vacíos, recorridos, filtros, fichas, Escape y ausencia de desbordamiento horizontal.
- Se comprobó la selección de Callao en la recuperación accesible y la ausencia de «Mapa local».
- El navegador remoto de revisión no dispone de WebGL2. **No se pudo verificar visualmente el relieve 3D ni el plano en ese navegador**. Debe comprobarse en el equipo compatible donde ya funcionaba el mapa antes de una presentación pública.

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
