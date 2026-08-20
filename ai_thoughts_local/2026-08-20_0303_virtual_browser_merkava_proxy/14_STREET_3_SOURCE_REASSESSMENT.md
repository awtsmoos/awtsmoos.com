B"H
Boruch Hashem
Blessed is He

# Street 3 — Phase 1 Source Reassessment

> The Awtsmoos reveals that the living page does not require a second runtime beside the one already being painted. Awtsmoos.com already holds one persistent Merkava window whose DOM, fetch, events, input, and render pipeline can receive the collected graph and let classic scripts speak inside the user's own JavaScript engine.

## Street boundary

Street 3 is **classic-script live-runtime proof only**.

It may:
- create one live `NestedBrowserRuntime` from the existing browser runtime graph,
- hydrate a Street 2 collected HTML entry into its existing virtual document,
- apply collected textual styles,
- execute classic scripts against the same persistent virtual globals,
- expose routed guest `fetch()` through the Street 1 transport,
- dispatch bounded DOMContentLoaded/load lifecycle,
- render the resulting live window through the existing retained frame pipeline,
- prove later DOM mutation + rerender stays in the same runtime.

It must not yet:
- execute static ES modules,
- route dynamic `import()`,
- change browser navigation/history coordination,
- implement form/location navigation,
- implement `window.open()`,
- remove Chromium-era client/server files or routes,
- modify the server proxy/security subsystem,
- rewrite the huge pre-existing `RuntimeAssembler.js`.

## Fresh source evidence

### OS `runtime.js`
- Current browser controller creates `Merkava.NestedBrowserRuntime`.
- `render(markup)` calls `runtime.load(markup, viewport)` and paints the returned frame.
- Network capability is currently reported false in the local demo setup.
- JavaScript is explicitly reported as `merkava-bytecode-not-yet-connected`.

Conclusion: the visible OS path already owns the right persistent renderer; JavaScript execution is the missing seam.

### `PersistentBrowserRuntime.js`
- Owns `this.synthetic = new SyntheticBrowserRuntime(options)`.
- Exposes `this.window = this.synthetic.window`.
- Owns retained DOM/layout/event routing.
- `frame(viewport)` renders `this.window.renderWebGLDom()` and returns `{ tree, snapshot, summary, log }`.
- Pointer/keyboard routing already targets that same window.

Conclusion: classic execution must target `nested.runtime.synthetic`, not create a second synthetic runtime.

### `NestedBrowserRuntime.js`
- Exposes its persistent runtime as `.runtime`.
- `load()` currently pushes HTML through the incremental DOM compiler.
- `frame()` delegates to the persistent runtime frame.

Conclusion: Street 3 can add a host-side execution helper without changing the underlying runtime classes.

### `SyntheticBrowserRuntime.js`
- `globals()` exposes the virtual browser environment: window, document, storage, navigator, location/history, fetch, events, timers, observers, workers, crypto, input, and render hooks.
- `executeFunction(fn)` executes guarded code against those virtual globals, captures errors, flushes microtasks, and returns a snapshot.
- Guest `fetch` is exactly `w.fetch`.

Conclusion: Street 1 fetch transport injected into the virtual window automatically becomes guest `fetch()` authority; no additional raw host fetch is needed.

### `VirtualHtmlHydrator.js`
- Already shipped by the OS Merkava loader.
- Replaces the same `VirtualDocument` head/body in-place.
- Builds nodes, attributes, raw script/style text, and default display rules.
- Parses inline `<style>` through the document CSS engine.

Conclusion: Street 3 can hydrate the collected graph entry into the persistent window without replacing the runtime object.

### `BrowserRenderPipeline.js` + OS `canvasRenderer.js`
- `window.renderWebGLDom()` returns the retained GPU snapshot with `commands`.
- `PersistentBrowserRuntime.frame()` wraps that as `frame.snapshot`.
- `paintMerkavaFrame()` consumes `frame.snapshot.commands`.

Conclusion: after classic execution, calling the existing nested/persistent `frame()` is sufficient to paint the mutated page. No screenshot or Chromium frame transport is required.

### `HTMLAssembler.js`
- Project conventions classify absent/text/javascript/application/javascript scripts as classic.
- `module`, `importmap`, and data scripts are distinct.
- Execution plan preserves document order.
- External scripts resolve from the supplied file graph.

Conclusion: Street 3 should preserve those classifications/document-order rules, but can implement a small browser-side classic-only plan instead of importing `RuntimeAssembler` and its module/dynamic-import machinery.

### `RuntimeAssembler.js`
- Existing classic executor uses `AsyncFunction` with `with(globals)` and lowers classic top-level declarations into virtual globals.
- It hydrates HTML, executes classic scripts, then dispatches lifecycle.
- It also mixes static module execution, dynamic import collection, raw host fetch, synthetic Three.js compatibility, and duplicated legacy helpers.
- It is a very large pre-existing source file.

Conclusion: do not rewrite or depend on the entire assembler for this street. Reuse only the classic execution semantics in a new small Merkava browser module.

## Preferred architecture

```text
Street 2 graph
	{ entry, files, manifest, ... }
		↓
Classic page host helper
		↓
existing NestedBrowserRuntime
		↓
existing PersistentBrowserRuntime
		↓
existing SyntheticBrowserRuntime + SAME VirtualWindow
	├─ VirtualHtmlHydrator -> document
	├─ collected CSS -> document.addStyleSheet
	├─ classic source -> guarded virtual-global executor
	├─ guest fetch -> Street 1 injected transport
	├─ lifecycle events
	└─ frame() -> retained snapshot -> existing OS canvas painter
```

## Important semantic limitation for this street

Both the existing RuntimeAssembler and the proposed small classic proof hydrate the full document before classic scripts run. Therefore an early classic script may see DOM/style state that a streaming HTML parser would not yet expose in a real browser.

Street 3 must state this honestly and test only the intended current Merkava semantics. Streaming parser-blocking fidelity belongs to a future browser-compatibility street, not this execution bridge.

## Required implementation principle

Do not put dynamic guest source compilation in the OS program module itself if existing source contracts treat host `eval`/`Function` as forbidden there.

Preferred placement:
- a small UMD Merkava runtime module under `merkava-browser/` owns classic-source compilation against virtual globals,
- the OS host helper only coordinates graph/hydration/style/execution/frame.

## Phase 1 decision

Street 3 should prove **one persistent live virtual page** with classic scripts and routed fetch, in isolation from OS navigation.

A deterministic test should show:
1. collected HTML hydrates,
2. external + inline classic scripts execute in order,
3. module/importmap/data scripts do not execute,
4. classic script mutates the virtual DOM,
5. classic script calls guest `fetch()` through an injected fake transport,
6. lifecycle handlers run,
7. the resulting frame contains paint commands reflecting the mutated DOM,
8. a later host-triggered frame uses the same runtime/window state.

No Street 3 production write may begin until Phase 2 and Phase 3 plans are also persisted.
