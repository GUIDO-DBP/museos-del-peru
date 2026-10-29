# Museos del Perú

Proyecto React + TypeScript + Vite + Tailwind CSS. Antes de editar, leer README.md. No depende de Figma Make ni necesita backend.

- `src/App.tsx`: estructura visual y filtros compartidos.
- `src/data.ts`: base de 66 registros y 25 territorios.
- `src/enrichment.ts`: contenido ampliado con procedencia, créditos y fecha.
- `src/photo-enrichment.ts`: fotos adicionales; respetar derechos institucionales y créditos.
- `src/museum-content.ts`: reseñas y destacados de los 66 museos.
- `src/museum-resources.ts`: recursos digitales documentados; auditoría en public/resource-audit.json.
- `public/photo-evidence.json`: trazabilidad fotográfica.
- `src/components/PeruMap.tsx`: MapLibre Relieve 3D y Plano; recuperación mediante selector de regiones, sin mapa local.
- `public/maps`: cartografía local; las capas 3D remotas se documentan en README.
- `src/index.css`, `src/exhibition.css`, `src/fonts.css`: diseño y fuentes locales.

Conservar el catálogo salvo correcciones documentadas. No inventar fotos, direcciones, coordenadas ni enlaces. Mantener atribuciones y licencias. Mantener la alternativa accesible al mapa y el manejo de foco de los diálogos.

Comprobaciones: `npm test`, `npm run check`, `npm run build`. Resultado estático en `dist`. `netlify.toml` prepara el despliegue. No incluir node_modules ni archivos de QA temporal en entregables.
