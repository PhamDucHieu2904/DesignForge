# ADR-0008 — Prompt Library migration

## Status

Accepted on 2026-09-15.

## Context

The legacy barcode-generator contains eight prompt templates, editable basic and advanced fields, literal interpolation, browser drafts, editable output, copy actions and user-initiated links to Gemini and Dola. DesignForge previously showed only three placeholder cards without the builder behavior.

## Decision

- Preserve the eight source templates as serializable JSON under `src/features/prompts`.
- Keep interpolation and validation in a pure engine independent of React and browser storage.
- Put draft persistence behind a repository adapter.
- Present the templates as a searchable thumbnail grid and open the editor in a focused modal with progressive disclosure for advanced fields.
- Keep provider actions as explicit external links triggered by the user; DesignForge does not call an AI API.
- Ship prompt thumbnails as local build assets.

## Consequences

The prompt library now retains the legacy content and browser-only workflow while fitting the white and purple DesignForge system. The current registry contains one populated source category (`juice`); future categories can be added without changing the engine or page structure.
