# DesignForge — project working agreement

## Canonical project location

This is the active DesignForge source and build repository: `D:\program project\DesignForge`.
The folder `D:\Vinut-TK\Documents\ChatGPT\DesignForge` is a historical mirror. Do not edit, build, test, or run that mirror unless the user explicitly asks for it.

## Read before work

1. `docs/MASTER-PLAN.md` for scope and architecture.
2. `design-system/designforge/MASTER.md` for visual rules.
3. `docs/PROGRESS.md` for current state.
4. `docs/SOURCE-AUDIT.md` before migrating any legacy feature.
5. `docs/SKILL-APPLICATION.md` for the skill workflow and original sources.

## Product constraints

- DesignForge is a design resource hub with tools, resources, skills, prompts and collections. Barcode tools are one module within the platform.
- Use the current modern creative-tech visual identity: deep navy canvas, violet/cyan gradient accents, glass surfaces, high legibility and labeled navigation. Bitakon may inform the gallery density and card rhythm, but do not copy NFT or marketplace semantics.
- One stable responsive layout. Do not add layout switching, desktop simulation, draggable app windows, wallpaper controls or ornamental system widgets.
- Do not add AI Remove Background to navigation, search, routes, dependencies or shipped assets.
- Preserve all other identified legacy capabilities in the migration backlog. Complex PDF/OCR capabilities must not silently disappear because they are difficult.
- UI and client functionality come first. Prepare typed data boundaries now; production backend, auth and administration come later.
- Never present mock data as live usage statistics, real accounts, server persistence or verified third-party availability.

## Engineering principles

- The target stack in the master is a proposal, not an existing installation. Record its validation before scaffolding dependent modules.
- Feature modules own their domain logic. Shared UI must not import tool implementations.
- Keep processing engines separate from React, DOM lookup, storage and networking.
- Use typed repositories/adapters; components must not fetch arbitrary endpoints or write directly to browser storage.
- Keep executable module loaders in code, and catalog metadata serializable. Backend metadata must never become arbitrary dynamic imports or executable scripts.
- Lazy-load heavy PDF/image/OCR capabilities. Clean up workers, object URLs, subscriptions and canvas memory.
- Use semantic design tokens and one icon family; avoid copying legacy global CSS.
- Validate exports by reopening/decoding them, not just checking that a file exists.
- Read source code again before migration; source folders can change after the planning snapshot.
- Changes are confined to DesignForge unless the user requests changes to a source project.

## Continuity

- Update `docs/PROGRESS.md` after each meaningful milestone, with files changed, checks performed, known limits and next step.
- Record architectural changes in `docs/decisions/ADR-xxxx-title.md` when implementation starts.
- Update the master and design system when a confirmed decision changes. Avoid contradictory duplicate specifications.
- Do not mark a milestone complete without its acceptance evidence. Avoid claiming all skill datasets were memorized; consult the relevant source when applying it.
