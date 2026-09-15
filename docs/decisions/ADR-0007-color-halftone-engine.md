# ADR-0007 — Color Halftone engine boundary

## Context

The legacy `barcode-generator` app already had a working single-colour halftone filter. DesignForge needs the same local workflow inside the Img Filter module, while leaving room for additional image filters and a future backend adapter.

## Decision

Port the pixel sampling and dot geometry into `src/features/image-filter/engine.ts`. The engine accepts `ImageData` pixels and typed settings, then returns serializable dots or SVG markup. React owns file selection, canvas preview and downloads; the engine does not access the DOM, storage, network or React state.

The first workspace exposes the legacy behavior: circle, triangle, square and diamond dots; minimum and maximum dot size; spacing; contrast; halftone colour; PPI metadata; PNG and SVG export. Processing remains local in the browser and source images are downscaled to a maximum dimension of 2200px before sampling.

## Consequences

- The legacy visual algorithm can be tested independently and reused by a worker or backend adapter later.
- PNG preview and SVG export share the same generated dot list, so their geometry stays consistent.
- Image import is intentionally browser-only for this milestone; no server upload or persistence is introduced.
- Additional filters can add sibling engines without coupling the shared catalog or UI shell to implementation details.
