B"H
Boruch Hashem
Blessed is He

# Street 2 — Line-Limit Amendment

The real-root closure audit found two Street 2 production files above the project ceiling:

- `remoteModuleResources.js`: 124 lines
- `remoteResourceFetch.js`: 122 lines

No behavior failure was found. The correction is structural only and must preserve all passing contracts.

## Correction A — module lexical mask split

Create `remoteJsCodeMask.js` containing the existing `codePositions()` lexical state machine.

Fully rewrite `remoteModuleResources.js` to import `codePositions()` rather than embedding it.

Requirements:
- preserve static import/export parsing exactly,
- preserve string/comment/template masking behavior,
- preserve dynamic `import()` / `require()` exclusion,
- rerun module parser tests after the split.

## Correction B — resource-budget split

Freshly read `remoteResourceFetch.js`, then move only its pure budget/default-limit helpers into a new small module, likely `remoteResourceBudget.js`.

Requirements:
- preserve max files, per-file bytes, total bytes,
- preserve existing error codes,
- preserve manifest secrecy and deduplication,
- rerun the graph test after the split.

## Gate

Do not alter collector semantics while satisfying the line ceiling. After both splits:

1. syntax-check each changed/new file,
2. rerun focused affected tests,
3. rerun line-count audit,
4. continue Street 2 closure only when every production file is <=120 lines.
