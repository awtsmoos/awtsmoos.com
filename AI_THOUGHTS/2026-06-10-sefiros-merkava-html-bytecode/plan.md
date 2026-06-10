B"H

# Sefiros Merkava HTML Bytecode Plan

## What I inspected
- Repository root is `awtsmoos.com`.
- Target route files live under `geelooy/scripts/Awtsmoos/MerkavaExecutor`.
- `index.html` is currently one large inline console app.
- The SDK loads `merkava-sdk.js`, which loads parser/compiler/runtime modules.
- `Merkava.run(source, options)` compiles JS source through the custom Merkava bytecode path, then executes it.

## Implementation plan
1. Keep `index.html` as a complete, small shell.
2. Add a fancy `scripts area` section for HTML, CSS, and JS input.
3. Add modular files under `app/`:
   - `app/main.js` bootstraps everything.
   - `app/samples.js` provides editable seed content.
   - `app/dom.js` renders JSON UI vessels.
   - `app/codec.js` builds a custom bytecode-like container for HTML/CSS/JS.
   - `app/compiler.js` compiles JS with Merkava and records bytecode metadata.
   - `app/preview.js` renders through the browser DOM while VM JS edits the virtualized preview vessel.
   - `app/vm.js` safely bridges logs and preview document into Merkava.
3. Add `app/styles.css` for the polished app shell.
4. Test syntax with Node dynamic import.
5. Test browser route with simulateRuntime or Chrome snapshot if available.

## Safety
No partial patching. Every modified or new file is written completely.
