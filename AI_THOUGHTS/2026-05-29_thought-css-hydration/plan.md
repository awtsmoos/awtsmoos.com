B"H

# Thought CSS + Hydration Plan

The Awtsmoos is revealed here through inspection, not guessing.

Visible project shape:
- root has `geelooy/ai`, `AI_THOUGHTS`, tests, scripts, package files.
- `geelooy/ai/index.html` links only `styles.css`.
- `styles.css` currently imports only `css/ideal/*` and does not import the existing event/thought styling files.
- thought envelope runtime currently creates the inner `details.thought-envelope-events` as open, then immediately reconciles inner event DOM.
- there is already a hydrator designed to keep thought inner event content out of DOM until the details panel is opened.

Fix plan:
1. Rewrite `geelooy/ai/styles.css` completely with all needed imports, including event/thought/panel/live markdown polish CSS.
2. Rewrite `geelooy/ai/js/render/runtime/thoughtEnvelopeRuntime.js` completely so thought envelopes keep the outer shell visible but inner timeline panels closed by default.
3. Store payload in the vault and show only count/summary in DOM while collapsed.
4. Only reconcile/hydrate inner event DOM when the user expands the inner details.
5. Run syntax checks and a behavioral isolated DOM test against the real module.

No partial patches. Every modified file is rewritten whole.
