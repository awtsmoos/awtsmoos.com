B"H

# Specific Fix Plan: API Key Vault DOM Safety

Audit finding:

`js/features/apiKeys.js` uses `innerHTML` for saved-key cards and an empty-state notice. It escapes dynamic text, but the file already has a pure DOM generator available in `js/ui/core/html.js`. Rewriting this file removes a future XSS/layout risk and makes button binding safer.

Target file:

- `geelooy/apps/tunnel-control/js/features/apiKeys.js`

Exact rewrite goals:

1. Import `h` from `../ui/core/html.js`.
2. Replace all `innerHTML` with `replaceChildren()` and generated elements.
3. Build saved key cards as data-driven DOM nodes.
4. Avoid `querySelector(...).onclick` assumptions by binding button nodes directly.
5. Guard optional DOM targets in `setKeyPill()` so missing panels do not crash the whole UI.
6. Preserve all existing behavior:
   - selected scopes
   - active key pill
   - saved key list
   - created key save/activate
   - pasted key save/activate
   - active key clear
   - feedback/log behavior
7. Re-run `node --check` for the rewritten file.
8. Re-run DOM safety scan to confirm `apiKeys.js` no longer contains innerHTML.
