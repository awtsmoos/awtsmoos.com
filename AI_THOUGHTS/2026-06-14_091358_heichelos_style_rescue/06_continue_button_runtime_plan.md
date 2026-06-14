B'H
# Continuation Button Runtime Plan

User challenged certainty and asked to keep going. Fresh evidence found two real risks:

1. Heichel drawer button was wired, but the JS toggled `sidebar-collapsed` while the repaired CSS opens on `sidebar-open`. That means the hamburger could still visually do nothing. This is exactly the kind of button failure the user warned about.
2. The visible `Filter` button in `main-layout.js` had no event handler. Search input worked on typing, but the button itself was inert.

Immediate fix:
- Rewrite `geelooy/heichelos/heichel/modules/ui/render.js` so `toggleSidebar` toggles `sidebar-open`, updates aria-expanded, and shows ☰ / ×.
- Rewrite `geelooy/heichelos/heichel/modules/ui/blueprints/main-layout.js` so Filter has a ref and click event.
- Update `mobileStyleContract.test.mjs` so it checks the JS/CSS class contract and the filter button event.
- Run focused tests plus syntax checks.

This continuation is justified because it is safe, directly relevant, and based on inspected code, not guesswork.
