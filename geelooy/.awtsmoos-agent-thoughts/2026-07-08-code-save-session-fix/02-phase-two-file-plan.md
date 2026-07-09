# B"H — Phase Two File Plan

Files likely touched only by full rewrites:

1. `apps/code/js/session/actions.js` — new tiny adapter exporting `saveSession()` and `saveSessionDebounced()`; no App import, no UI import, no cycle.
2. `apps/code/js/app/index.js` — import the adapter and wire App methods to it.
3. `apps/code/js/app/listeners/editor.js` — replace App import with session adapter; compute tab string from State locally so this leaf listener no longer imports App.
4. Other save-only callers discovered by grep may be rewritten to use the adapter. Candidates include tab activation orchestrators, tabs creation/lifecycle/index, browser runtime/index, devtools Dispatcher/elements, workspace tree renderer/folder togglery/remover/adder, virtual-os env modules, ssh workspace, workspace addition, sync folder sync.

Constraints:
- No partial patching. Every touched file must be fully rewritten.
- Preserve behavior: same localStorage key, same debounce timing, same dirty tab flow, same render calls.
- Prefer small modules and keep new code under 120 lines. Existing larger files should only be rewritten when needed for the save-call cycle.

Verification plan:
- Static grep: no `App.saveSession` or `App.saveSessionDebounced` remains in leaf modules.
- Syntax check via dynamic import or Node parser where possible.
- Browser reload or at least local command verification if browser target unavailable.
