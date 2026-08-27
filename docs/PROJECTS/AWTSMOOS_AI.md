B"H
Boruch Hashem
Blessed is He

# Awtsmoos AI

The Awtsmoos lets language and model computation enter many vessels while Awtsmoos.com keeps browser AI, server APIs, local-model work, search and developer integrations distinct enough to reason about safely.

## Primary source areas

- `geelooy/ai/` — large browser-facing AI project.
- `geelooy/api/gpt/` — GPT health/capability/chat/reset HTTP family.
- `geelooy/apps/awtsmoos-gguf/` — local/GGUF model tooling.
- Awtsmoos Code AI integrations — developer workflows.
- dynamic-server AI helpers — server-side model/provider plumbing where imported.
- search/vector/graph systems — related data systems, not automatically the same API contract.

## Do not flatten AI into one backend

A local GGUF app, browser chat page, provider-backed GPT API, embedding/search pipeline and Code AI feature can share concepts without sharing credentials, model format, request schema or lifecycle. Begin from the concrete caller/source pair.

## Generated evidence

Use `PROJECT_ATLAS.md` for AI project boundaries, `PROJECT_SYMBOL_SUMMARY.md` for lexical symbol summaries, `PROJECT_DEPENDENCIES.md` for cross-project imports, `API_ROUTE_CONTRACT_ATLAS.md` for GPT routes, `API_CALLER_INDEX.md` for browser callers and `ENVIRONMENT_VARIABLES.md` for configuration names without values.

## Human manuals

- `docs/SYSTEMS/AI.md`
- `docs/API/OTHER_FAMILIES.md`
- `docs/CONFIGURATION.md`
- `docs/INTEGRATIONS.md`
- `docs/SECURITY/SECRETS_AND_CONFIG.md`

## Change strategy

For model/provider/API changes, trace the exact caller, configuration source, failure shape and tests. For local models, inspect model-file/runtime assumptions. For search/embedding changes, treat index/data paths as persistence contracts. Verify only the layers actually involved rather than assuming every AI-labelled feature shares one runtime.
