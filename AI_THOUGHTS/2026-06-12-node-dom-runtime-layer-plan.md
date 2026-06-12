B"H
# Node DOM Runtime Layer Plan

Chapter 364: The Node flame asked for a body.

The goal is to add a new simulateRuntime engine where JavaScript executes in Node.js, while a virtual browser body surrounds it: document, window, DOM events, fetch, storage, timers, modules, and browserActions. This must coexist with Merkava and Chrome fallback paths.

## 1. Public API shape

Add engine values:

- engine=node-dom
- engine=nodejs-dom
- engine=node-virtual-browser

All are aliases for one implementation.

Example:

```json
{
  "action": "simulateRuntime",
  "runtime": "browser",
  "engine": "node-dom",
  "entry": "index.html",
  "browserActions": [
    { "action": "fill", "selector": "#name", "value": "Dovid" },
    { "action": "click", "selector": "#go" },
    { "action": "assertText", "selector": "#out", "expected": "Hello Dovid" }
  ],
  "returnValues": ["document.body.textContent", "window.clicked"]
}
```

## 2. File layout

Create small modules under:

```text
apps/tunnel/agent/tools/fs/nodeDomRuntime/
  index.js
  options.js
  htmlDocument.js
  virtualWindow.js
  events.js
  actions.js
  modules.js
  timers.js
  storage.js
  fetch.js
  snapshot.js
  selectors.js
  result.js
```

Keep every file under about 100 lines.

## 3. Runtime entry point

`index.js` exports:

```js
async function simulateNodeDomRuntime(options) {}
```

Input should match Merkava service options from `collectOptions()`:

- runtime
- entry
- files
- virtualEnv
- browserActions
- pageActions
- interactions
- returnValues
- waitMs
- timeoutMs

Output should mimic Merkava response shape:

```js
{
  ok,
  engine: "node-dom",
  score,
  entry,
  console,
  errors,
  interactionLog,
  values,
  domSnapshot,
  virtualEnv
}
```

## 4. Integration in runtimeActions.js

Modify only complete file.

In `runService(payload, method, config)`:

1. Expand payload.
2. Collect options.
3. If `payload.engine` is node-dom alias, call local node-dom runner.
4. Else use current Merkava path.
5. Add fallback routing:
   - preferred engine requested: use it.
   - engine=auto: node-dom first for simple browser runtime, then Merkava, then Chrome if available.

Do not remove current Merkava behavior.

## 5. DOM implementation strategy

Phase 1 should borrow concepts from Merkava, not copy giant files blindly.

Minimum DOM:

- Document
- Element
- Text node
- DocumentFragment
- Template element support
- querySelector/querySelectorAll for id, class, tag, simple descendants
- getElementById
- createElement
- createTextNode
- appendChild, removeChild, replaceChildren
- setAttribute/getAttribute/hasAttribute
- classList
- style object
- textContent and innerHTML enough for tests
- form controls: input.value, select.value, button.click

Phase 2:

- shadowRoot
- canvas stub
- MutationObserver stub
- customElements minimal registry

## 6. HTML hydration

`htmlDocument.js` parses HTML into the virtual DOM.

Options:

- Reuse Merkava HTML hydrator if directly importable without huge runtime coupling.
- If not, write a small deterministic parser for test-grade HTML.

Required script handling:

- Ignore `<script type="importmap">` during execution but parse import map for module resolver.
- Execute inline classic scripts.
- Execute inline module scripts through module runner.
- Execute external scripts from `files` map.
- Load CSS refs only as connected files, not as real CSS engine in phase 1.

## 7. Node VM execution

Use Node `vm` module.

Each runtime world gets isolated context:

- window
- document
- console collector
- setTimeout/clearTimeout
- Promise from host
- fetch shim
- localStorage/sessionStorage
- Event, MouseEvent, KeyboardEvent, CustomEvent
- HTMLElement aliases as needed

Never use global mutable singleton state.

## 8. Module system

`modules.js` implements:

- static import support by transforming ESM to async CommonJS-like wrappers, or using `vm.SourceTextModule` if available.
- dynamic import support.
- import map resolution.
- relative path resolution using the existing runtime path utils.

Recommended first phase:

- Use a small transform for imports/exports already covered by connected refs:
  - `import x from './x.js'`
  - `import { a } from './x.js'`
  - `export const x = ...`
  - `export default ...`
  - `export * from './x.js'`
- Later upgrade to Merkava parser or Node SourceTextModule.

## 9. Browser actions compatibility

`actions.js` must support same action grammar as Merkava tests:

- waitForSelector
- click
- fill/type
- assertText
- assertValue
- evaluate
- snapshot
- waitMs/waitForTimeout

Return `interactionLog` entries matching Merkava enough that current tests pass.

## 10. Timers and event loop

This is the main reason to build the Node layer.

Create `timers.js` with per-runtime timer queue:

- setTimeout(fn, ms)
- clearTimeout(id)
- setInterval/clearInterval later
- flushMicrotasks
- advanceTime(waitMs)

At the end:

1. Execute all sync scripts.
2. Flush microtasks.
3. Advance timers up to waitMs.
4. Flush microtasks after every timer.
5. Run browserActions.
6. Advance timers again if actions schedule work.
7. Snapshot.

This directly fixes the class of issue found in `runtime-merkava-heavy-parity`: `ok:true` with timer mutation missing.

## 11. Fetch/storage

`fetch.js` handles:

- data: URLs
- files from virtualEnv by relative path
- JSON/text/blob-ish enough for tests
- optional network disabled by default

`storage.js` implements localStorage/sessionStorage per runtime instance.

## 12. Testing plan

Add:

```text
apps/tunnel/agent/tools/fs/testing/node-dom-runtime-actors.test.cjs
```

Actor suite:

1. TimerActor
   - Promise + setTimeout order must produce `ORDER:sync,micro,timeout`.

2. DomActor
   - create 500 nodes, querySelectorAll, textContent.

3. EventActor
   - input, click, change, dispatchEvent.

4. ModuleActor
   - external module script imports relative module and sets DOM text.

5. ImportMapActor
   - import alias resolves.

6. FetchActor
   - data URL JSON and local `./data.json`.

7. BrowserActionActor
   - fill/click/assert/evaluate/snapshot.

8. ParityActor
   - same fixture runs under node-dom and Merkava. Compare major markers.

Run with:

```bash
node apps/tunnel/agent/tools/fs/testing/node-dom-runtime-actors.test.cjs
node apps/tunnel/agent/tools/fs/testing/connected-bulk-runtime-actors.test.cjs
node apps/tunnel/agent/tools/fs/testing/runtime-actions-real.test.cjs
node apps/tunnel/agent/tools/fs/testing/bulk-runtime-browser-actions.test.cjs
```

## 13. Consolidation plan

Do not delete public aliases.

Internally consolidate into engines:

- `paged file reader`: bulk, connectedFiles bulk mode, readMany files.
- `connected graph collector`: connectedFiles, runtimeVirtualEnv, simulateRuntime file collection.
- `runtime service runner`: Merkava, node-dom, Chrome fallback all share collectOptions and result normalization.
- `action executor`: browserActions grammar shared by Merkava/node-dom/Chrome.

## 14. Rollout plan

Step A: Build nodeDomRuntime modules with only inline HTML and classic script.
Step B: Add browserActions.
Step C: Add external scripts from virtualEnv.
Step D: Add modules/import maps.
Step E: Add fetch/storage/timers parity.
Step F: Add `engine=auto` routing.
Step G: Refactor shared browser action grammar.

## 15. Safety gates

- No destructive commands.
- Every modified file rewritten fully.
- No file over 150 lines.
- Tests must run after every phase.
- Live tunnel restart required before testing through remote action endpoint.
