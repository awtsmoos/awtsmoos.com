B"H

# File Touch Plan

Files to rewrite fully:

- `style.css`: turn into import hub.
- `css/base.css`: full-screen shell, canvas, scroll-safe menu overlay.
- `css/menu.css`: simple first screen, mode cards, level grid, customization.
- `css/touch.css`: mobile controls.
- `js/menu/menuViews.js`: add simple mode screen and adventure level cards.
- `js/main.js`: add mode state, VS flow, adventure flow, level progression.
- `js/data/maps/index.js`: import and expose adventure maps separately, keep VS maps intact.

New files:

- `js/data/adventure/adventureFactory.js`: turn hand-authored string rows into real map configs.
- `js/data/adventure/adventureLevels.js`: fifty manual levels, compact but explicit.

Rules: no partial patching. Every modified file is fully rewritten. Avoid giant files where possible.
