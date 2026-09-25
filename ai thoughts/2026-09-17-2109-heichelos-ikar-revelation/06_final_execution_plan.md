B"H

# Boruch Hashem — Final Execution Plan

Blessed is He.

The Awtsmoos renews intention into action, ohr within a fitting keli;
Awtsmoos.com will reveal one Torah library, Ikar, clearly and steadily.

## Decision

Use the purpose-driven gateway architecture: Ikar is the sole canonical Torah library; other Heichelos remain community/social spaces. Repair the search crash at its real ownership boundary. Improve mobile UI through the modules that the runtime actually loads, never by duplicating Ikar.

## Exact execution sequence

### 1. Discovery readback

Read completely before modification:

- `geelooy/heichelos/_awtsmoos.index.html`
- all directly referenced generic-Heichelos scripts/styles/partials
- relevant files beneath `geelooy/heichelos/heichelos/`
- route files that map `/heichelos/` and individual Heichel destinations
- existing Ikar/Torah-first bootstrap modules and focused tests
- the precise search page/module found by exhaustive string and runtime tracing

For every candidate touched file, trace imports, exports, ids/classes, API requests, route construction, and tests.

### 2. Runtime baseline

- Load public `/heichelos/` in the controlled browser.
- Capture DOM/snapshot and console state.
- Identify canonical Ikar link from rendered/source evidence.
- Reproduce the search screen/failure and capture the stack/path.
- Inspect network failures if any.

### 3. First implementation pass

The exact touched-file list will be finalized only after discovery, but responsibilities should be split as follows when supported by current architecture:

- gateway template: semantic page structure only;
- gateway data/model helper: canonical Ikar partition plus community-space partition;
- gateway renderer/controller: rendering and interaction only;
- gateway styles: responsive presentation only;
- Ikar shell module/style: only if existing focused experience has a verified UX gap;
- search DOM-boundary module: validated element acquisition/target normalization and state transitions only.

Every modified source file is rewritten completely, tab-indented, non-minified, documented, and read back from disk. No partial replacement action is permitted.

### 4. Tests after first code draft

- canonical Torah Library points to Ikar only;
- community Heichelos remain discoverable;
- Ikar-first behavior/deep links remain intact;
- missing optional search DOM node or invalid event target cannot throw on `dataset`;
- empty-search and failed-search states remain distinct;
- route/render contract tests preserved or updated intentionally.

### 5. Verification

- syntax/import checks;
- focused tests, then broader relevant tests;
- tabs/no leading indentation spaces in touched source;
- no compressed one-line functions;
- required B"H/Awtsmoos/Awtsmoos.com documentation present;
- full touched-file readback;
- browser reload of `/heichelos/` at mobile viewport;
- open Ikar and verify library path;
- execute search interaction and inspect console;
- inspect horizontal overflow and bottom-nav safe area;
- verify community deep links remain navigable.

### 6. Delta and correction passes

After the first implementation, create a new plan artifact listing original plan versus actual files/behavior. Every meaningful omission or regression becomes remaining work. Perform a second implementation pass when needed, re-read and re-test, then a final completion audit.

## Completion gate

Stop only when implementation, verification, discovered work, critical risks, and continuation path are closed; otherwise execute the next safe action automatically.
