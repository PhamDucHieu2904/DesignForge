# ADR-0010 — PDF Prepare Form workspace

## Status
Accepted — 2026-09-26

## Context
DesignForge already provides PDF conversion and editing cards. Users also need to place fillable fields on an existing PDF and export a reusable form without uploading the source document to a server.

## Decision
Add a dedicated `pdf-prepare-form` tool in the PDF collection. PDF.js renders the selected page to a local canvas and the React workspace keeps field rectangles in normalized page coordinates. `pdf-lib` creates AcroForm text and checkbox widgets during export; date and signature controls use text widgets so the resulting PDF remains fillable in standard viewers. PDF.js and its worker are copied into the application asset bundle, including the configured GitHub Pages base path.

## Consequences
Field placement remains stable across responsive canvas sizes because coordinates are normalized. All processing remains local. The workspace supports page navigation, named fields, text, checkbox, date and signature controls, zoom, pointer movement, Shift multi-select, Delete/Backspace removal, six-direction alignment for fields on the current page, a right-side layer inspector, and download. Digital certificate signing is outside this tool's scope; the signature control is a fillable text area intended for typed or drawn input in a downstream PDF viewer.
