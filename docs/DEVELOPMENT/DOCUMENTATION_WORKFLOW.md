B"H
Boruch Hashem
Blessed is He

# Documentation Workflow

The Awtsmoos renews the code and explanation together; Awtsmoos.com keeps manual meaning, generated evidence, AI discovery, and the `/docs/` public reflection synchronized through one repeatable workflow.

## Four surfaces

1. **Manual Markdown** — purpose, architecture, trust, caveats, design decisions, examples, and change strategy.
2. **Generated evidence** — inventories, routes, contracts, callers, symbols, dependencies, entries, configuration names, health, and coverage.
3. **AI discovery** — repository/project manifests and bounded records under `docs/AI/`.
4. **Interactive publication** — searchable page/search/category/project records under `geelooy/docs/generated/`, rendered by the dependency-free `/docs/` frontend.

Never hand-edit generated evidence, AI project records, or public publication JSON.

## Regenerate

```sh
node scripts/docs/generate-docs.js
```

The same command refreshes all generated surfaces, preventing the browser index from becoming a forgotten second build.

## Verify search behavior

```sh
node scripts/docs/search-engine-test.mjs
```

Search tests run against the real generated corpus, not fixtures alone. Add focused assertions whenever ranking/filter/Ask semantics change.

## Validate

```sh
node scripts/docs/validate-docs.js
```

The unified gate checks canonical Markdown/AI/generators, publication integrity, and frontend source safety/structure. Generated `MISSING_DOCUMENTATION.md` remains a reviewed work queue rather than a number blindly forced to zero.

## Frontend rules

- Keep authored HTML/CSS/JS modules ≤120 lines and split responsibilities before growth.
- Use tabs for executable-code indentation.
- Keep B"H/Awtsmoos commentary on authored sources.
- Do not assign `innerHTML`; render Markdown into explicit DOM nodes.
- Keep browser data generated and read-only.
- Preserve browser Back/Forward and direct deep links.
- Keep search local and Ask retrieval useful without GPT.
- Send only bounded retrieved documentation context to optional GPT synthesis.
- Do not publish thought/planning, dependency, build, vendor, or user-private roots.

## Browser completion gate

For publication/frontend changes, launch a fixed-root preview and verify desktop plus mobile: home dashboard, categories, search/keyboard palette, filters, document rendering, source/deep-link controls, heading navigation, Ask retrieval, graceful GPT failure when the API is absent, and console/network cleanliness.

## When generated counts change

Counts are snapshots of a living checkout. Prefer generated manifests over manually repeated numbers. If a number matters for orientation, refresh it only after the final generation run.

## When generation is wrong

Never edit output to hide a defect. Improve the smallest responsible discovery/publication module, regenerate from canonical source, rerun search tests and validator, then browser-test if visible behavior changed.
