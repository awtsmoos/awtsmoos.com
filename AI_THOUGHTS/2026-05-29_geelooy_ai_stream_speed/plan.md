B"H

# Geelooy AI stream speed plan

## Observed structure
- Root: `geelooy/ai` contains central provider code, render runtime code, CSS, and worker modules.
- Main render path: `js/render/messageRenderer.js` updates records, windows visible messages, and refreshes live message/event DOM.
- Message virtualization already exists through weighted windows and load-earlier/load-later gates.
- Event details are already headline-first: `eventDetails.js` emits a closed `<details>` shell with a payload key, and `eventBodyHydrator.js` hydrates body only on expand.
- Collapse already removes heavy bodies through `collapsedDomVault.js`.

## Problems found
- `liveTextRuntime.js` renders markdown for the entire growing answer during every streaming refresh. That keeps expensive parsing and `innerHTML` mutation on the main thread.
- `messageVault.js` has duplicate `purgeMemory()` methods.
- Expanded event panels hydrate from payload but need a clear refresh path for live-updated payloads while remaining removable on collapse.

## Safe changes
1. Split live text streaming into small modules.
2. During streaming, append only text-node deltas to the DOM; do not parse markdown and do not rebuild innerHTML.
3. On finalization, render markdown once, after the stream is complete.
4. Keep collapsed function/tool calls as headline-only details.
5. Ensure open event details can refresh their hydrated body from the latest payload while closed details keep zero body DOM.
6. Rewrite whole files only; no partial patching.

## Verification
- Run syntax checks on changed modules.
- Run import/module checks where possible.
- Search for remaining live streaming markdown calls.
