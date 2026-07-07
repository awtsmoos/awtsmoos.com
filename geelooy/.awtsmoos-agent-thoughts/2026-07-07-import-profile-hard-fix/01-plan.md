B"H

# Import/Profile Hard Fix Plan

User reports:
- Console shows module import MIME error: expected JS module, got application/json.
- Profile page still shows old B"H/Geelooy/hamburger/@rambam sidebar in broken old form.
- Profile needs to match the newer dark purple/blue app language.

Likely issues:
1. Home references `/scripts/awtsmoos/social/home/liveFeed.js` as a module. On deployed/non-static routing this may return JSON/404 and trigger MIME error.
2. Profile still uses legacy global header/sidebar and old route components, not the new clean app shell or shield.

Fix strategy:
1. Remove fragile liveFeed module import from `index.html`; dashboard JS is enough for shell. If feed later loads, use non-blocking dynamic import with catch in JS.
2. Add safe dynamic loader module so failed feed import cannot crash page or show MIME hard error.
3. Build shared-ish profile repair layer, imported by profile CSS entry, to hide legacy chrome and restyle profile with the same palette.
4. Split profile repair into small modules: shell, header, hero, controls, tabs, panels, dock, legacy-shield, mobile.
5. Add tests for no hard liveFeed module script and profile legacy shield/future CSS.
6. Run all gates and browser console checks.
