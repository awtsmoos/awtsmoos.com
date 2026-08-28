# B"H
# Gevurah — Boundaries for a Literal Site-Wide Rewrite

Boruch Hashem. Blessed is He.

The Awtsmoos gives every revelation a vessel; without Gevurah, a universal stylesheet becomes a flood. Awtsmoos.com therefore needs bounded foundations, explicit adapters, and proof before broad propagation.

## Hard constraints

- No destructive reset, clean, force checkout, or force push.
- Preserve all legitimate unrelated work into `main`; inspect before inclusion.
- Do not commit secrets, dependency caches, crash dumps, transient benchmarks, or machine-local state.
- Do not manually edit generated compact bundles or generated production CSS when generators exist.
- Whole-file rewrite only for human-authored mutations.
- Read full target files, direct imports/callers, and tests before rewriting.
- Touched modules remain <=120 lines of source responsibility; split instead of compressing.
- Tabs for indentation where valid.
- Every touched human-authored source begins with B"H/Boruch Hashem/Blessed is He and contains technically relevant Awtsmoos/Awtsmoos.com documentation.
- Global UI foundation must remain intentionally small and foundational.
- Route-specific presentation must be scoped under route/application roots.
- No arbitrary giant z-index values.
- No horizontal page overflow at 320, 375, 430, 768, 1024, desktop.
- Hover may enhance, never gate touch functionality.
- Reduced motion must preserve usability.
- No claim of “every page fixed” without automated route discovery plus representative browser coverage.
- Local `main` is behind origin by five commits; upstream reconciliation must occur before final push, without losing dirty work.

## Route graph — first revealed layer

### Core/public
`/`, `/about`, `/contact`, `/docs`, `/donate`, `/login`, `/register`, `/profile`, `/notifications`, `/portal`.

### Social
`/social`, `/social-hub`, `/social-composer`, `/comment-thread`, `/post-editor`, `/entity-view`, `/heichel-editor`, `/heichel-review`, plus deeper Heichel/profile routes.

### Work/tools
`/apps`, `/drive`, `/editor`, `/email`, `/record`, `/recorder`, `/ocr`, `/youtube`, `/fetch`, `/control`, `/db`, `/awtai-db`.

### Platform/runtime
`/os`, `/node-os`, `/ai`, `/game`, `/games`, `/mawgawl`, `/zmanim`, `/reeyuh`, `/sod`, `/ayin`.

### Deeper application families already dirty
Animator, Mitzvah Studio, Piano, Transcribe, Mitzvah World, Subway Surfer, Temple Runner, Ohrfront, Shema Strike, Sefarim, migration tools, API Explorer, Android emulator.

## Shared-foundation candidates requiring inspection

- `geelooy/style/universal-ui.css`
- `geelooy/style/universal-ui/*`
- `geelooy/style/geelooy-app/index.css`
- `geelooy/style/geelooy-app/shell.css`
- `geelooy/scripts/awtsmoos/ui/foundation.js`
- `geelooy/scripts/awtsmoos/ui/routeAdapters.js`
- `geelooy/scripts/awtsmoos/ui/routes/*`
- `geelooy/scripts/awtsmoos/ui/runtime/*`
- `geelooy/scripts/awtsmoos/ui/audit/*`

These files are already modified/untracked by concurrent work, so they must be read and semantically preserved rather than overwritten from assumptions.
