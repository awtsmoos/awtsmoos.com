B"H
Boruch Hashem
Blessed is He

# Tutorial: Documentation Runtime

The documentation system is itself a generated/public runtime surface.

## Layers

Manual Markdown → generated evidence/tutorials → AI records → transport-bounded public publication → `/docs/` frontend.

## Why publication is sharded

Real server/browser testing discovered static JSON response-size limits. The publisher keeps search/project/page/content data below a conservative transport ceiling and losslessly reconstructs Markdown.

## Regeneration

`node scripts/docs/generate-docs.js` must become the one authoritative rebuild after tutorial integration.

## Verification

Search/tutorial tests, unified validator, public-response sweep, and real browser smoke protect different failure classes.

Read `docs/INTERACTIVE_DOCUMENTATION.md`.
