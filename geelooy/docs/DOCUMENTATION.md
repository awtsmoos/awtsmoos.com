B"H
Boruch Hashem
Blessed is He

# Interactive Documentation Frontend

The Awtsmoos lets the repository's written map become a living public doorway; `geelooy/docs/` is the browser-facing documentation application for Awtsmoos.com.

## What this directory owns

- `index.html` — semantic application shell for `/docs/`.
- `styles/` — responsive visual system, document typography, rails, dialogs, and print behavior.
- `modules/` — dependency-free ES modules for state, search, navigation, Markdown rendering, Ask retrieval, optional GPT synthesis, and browser-local preferences.
- `generated/` — machine-generated transport-bounded publication data. Never edit this directory manually.

## Canonical content

The frontend is **not** the source of truth for documentation prose. Canonical human documentation remains in repository Markdown. `node scripts/docs/generate-docs.js` publishes an intentional searchable reflection into `geelooy/docs/generated/`.

## Bounded publication

`generated/manifest.json` declares search shards, project shards, categories, compact page metadata, and Markdown content shards. This design was proven necessary by real-browser testing: the existing Awtsmoos server returned HTTP 413 for larger JSON files. Content is split losslessly rather than truncated or served by changing unrelated server limits.

## Search and Ask

Global search runs locally in the browser. It supports ordinary terms plus `category:`, `kind:`, and `path:` filters. Ask retrieves local documentation passages first. The existing `/api/gpt/chat` relay may optionally synthesize only bounded retrieved context; if unavailable, cited local passages remain usable.

## Safety covenant

Markdown is rendered through explicit DOM construction. Raw Markdown HTML is not executed and frontend source does not assign `innerHTML`. Hidden agent-thought, generic thought, dependency, build, and vendor trees are excluded from publication.

## Human manuals

Read `docs/INTERACTIVE_DOCUMENTATION.md` for architecture and user workflow, `docs/MAINTAINING_THE_DOCS.md` for regeneration, and `docs/DEVELOPMENT/DOCUMENTATION_WORKFLOW.md` before changing the publication pipeline.

## Verification

```sh
node scripts/docs/generate-docs.js
node scripts/docs/search-engine-test.mjs
node scripts/docs/validate-docs.js
```

Browser verification covers desktop/mobile layout, search, deep links, document rendering, local Ask retrieval, graceful GPT unavailability, and console/network errors.
