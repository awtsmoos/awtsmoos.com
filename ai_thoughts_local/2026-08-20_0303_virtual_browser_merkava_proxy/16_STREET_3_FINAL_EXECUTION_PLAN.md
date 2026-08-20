B"H
Boruch Hashem
Blessed is He

# Street 3 — Phase 3 Final Execution Plan

> The Awtsmoos reveals one living page, one virtual window, one guarded road. Awtsmoos.com will not summon a second browser or a second DOM; it will awaken the persistent Merkava already being painted and let classic scripts speak only through its virtual globals.

## Exact Street 3 goal

Given a completed Street 2 graph, the Street 1 routed fetch transport, and the already-loaded Merkava browser modules, create one isolated live-page controller that hydrates the graph entry into the existing persistent virtual document, applies collected external stylesheet text, executes inline and external classic scripts in virtual DOM document order, exposes guest `fetch()` only through the injected Street 1 transport, dispatches DOMContentLoaded/load, returns retained paint frames from the same persistent runtime, supports later pointer/keyboard/frame calls against the same window state, and explicitly defers module/importmap/data scripts.

No OS navigation wiring occurs in this street.

## Exact production files

### `VirtualClassicScript.js`
Location: `geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualClassicScript.js`

Exports:
- `lowerVirtualClassicScript(source)`
- `executeVirtualClassicScript(runtime, source, meta?)`

Rules:
- UMD/browser-safe.
- No host network or host DOM/window references.
- Compile with AsyncFunction + `with(globals)` only inside this Merkava runtime module.
- Reuse the existing RuntimeAssembler declaration-lowering semantics in a focused form.
- Execute through `runtime.executeFunction()` for timeout/error/microtask capture.
- Preserve sourceURL testimony when a virtual URL is supplied.

### `classicPageDocument.js`
Location: `geelooy/os/programs/awtsmoos-browser/classicPageDocument.js`

Exports:
- `hydrateClassicPage(options)`
- `classicScriptPlan(document, files)`
- `applyCollectedStyles(document, files)`

Rules:
- Use `Merkava.VirtualHtmlHydrator` against `nested.runtime.window.document`.
- Hydrate only the rewritten Street 2 entry.
- Traverse the live virtual document after hydration.
- Skip script/link nodes under inert `<template>` ancestry.
- Treat absent/text/javascript/application/javascript/text/ecmascript/application/ecmascript as classic.
- Classify module/importmap/data/unknown types as non-executable testimony.
- Resolve external rewritten `src` and stylesheet `href` strictly through `graph.files`; no network fallback.
- Missing file yields warning, never raw fetch.

### `classicPageLifecycle.js`
Location: `geelooy/os/programs/awtsmoos-browser/classicPageLifecycle.js`

Exports:
- `dispatchClassicPageLifecycle(synthetic)`

Rules:
- Execute lifecycle dispatch through `synthetic.executeFunction()`.
- Set document readyState to interactive, dispatch DOMContentLoaded.
- Set readyState to complete, dispatch window load.
- Lifecycle handler errors become synthetic runtime errors.

### `classicPageRuntime.js`
Location: `geelooy/os/programs/awtsmoos-browser/classicPageRuntime.js`

Exports:
- `createClassicPageRuntime(options)`

Rules:
- Construct exactly one `Merkava.NestedBrowserRuntime` with `url`, `files`, and `fetchTransport`.
- Hydrate its same persistent window.
- Apply collected styles.
- Execute only classic steps in order through `Merkava.executeVirtualClassicScript`.
- Stop classic execution after first failed script, matching current RuntimeAssembler behavior.
- Dispatch lifecycle after successful classic sequence.
- Return bounded controller methods: `frame`, `pointer`, `keyboard`, `snapshot`, `summary`.
- Do not expose host globals or transport through snapshot/summary.

### `merkavaLoader.js`
Full-file rewrite only.

Change:
- add `VirtualClassicScript` to the UMD module list in dependency-safe order,
- bump build ID,
- preserve all current module order otherwise.

## Test files

### `virtual-classic-script.test.cjs`
Prove top-level declaration visibility across executions, virtual DOM mutation, bounded thrown errors, and absence of module behavior.

### `awtsmoosBrowserClassicPageDocument.test.mjs`
Prove graph entry hydration, collected stylesheet application, inline/external classic order, template-script exclusion, module/importmap/data/unknown classification, missing-file warnings, and zero network work in document planning.

### `awtsmoosBrowserClassicPageRuntime.test.mjs`
Prove one persistent runtime/window, classic DOM mutation, cross-script globals, guest fetch through injected fake transport, module non-execution, lifecycle handlers, retained paint commands, later-frame state persistence, and no public Internet/Chromium requirement.

## Validation order

1. Create `VirtualClassicScript.js` and syntax-check it.
2. Create `classicPageDocument.js` and syntax-check it.
3. Create `classicPageLifecycle.js` and syntax-check it.
4. Create `classicPageRuntime.js` and syntax-check it.
5. Freshly read and fully rewrite `merkavaLoader.js`; syntax-check it.
6. Write all Street 3 tests before running them.
7. Run classic executor, document-plan, and live-runtime tests individually.
8. Fix only proven defects by full-file rewrites.
9. Run Street 3 focused suite together.
10. Re-run Street 2 focused suite.
11. Re-run Street 1 focused suite.
12. Re-run existing Merkava advanced regression.
13. Re-run six non-Chromium proxy/security suites.
14. Line-count every Street 3 production file and structurally split any file above 120 lines.
15. Authority scan for Chromium/CDP/raw fetch/host DOM escape patterns.
16. Reread every Street 3 production/test file.
17. Write post-implementation delta and completion evidence.
18. Update remaining-work ledger with the next separate street.
19. Stop Street 3 only after all above evidence is green.

## Explicit non-goals / stop gate

Do not modify `runtime.js`, `remoteNavigationController.js`, `browserNavigationCoordinator.js`, `index.js`, server routes, or the Chromium interactive subsystem.

Do not execute static ES modules or dynamic imports.

A passing Street 3 proves the live classic-runtime vessel only. The next street must separately decide how remote navigation hands a Street 2 graph into this controller and how the old Chromium-era coordinator is unwound.
