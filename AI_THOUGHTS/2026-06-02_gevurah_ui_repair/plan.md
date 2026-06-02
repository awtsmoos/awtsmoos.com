B"H
# Gevurah UI Repair Plan

The screenshots show two live wounds:

1. Heichel listing cards render social actions immediately (`Comment`, `Repost`, `Reference`, `Share`). The user wants those hidden inside the three-dot card menu, not sitting on the card face.
2. The post reader locks the screen into a fixed 100vh grid with overflow hidden, then places sidebar and overlays over the reading area. On mobile this prevents natural page scroll and causes the A / B controls and content to be covered.

Real files inspected:
- `geelooy/heichelos/heichel/modules/ui/render/grids.js`
- `geelooy/heichelos/heichel/modules/ui/render/social-actions.js`
- `geelooy/heichelos/new-style.css`
- `geelooy/heichelos/heichelos/post/styles/main.css`
- `geelooy/heichelos/heichelos/post/styles/organisms/layout.css`
- `geelooy/heichelos/heichelos/post/styles/organisms/sidebar.css`

Fix path:

1. Rewrite `social-actions.js` to produce menu-sized action blueprints instead of card-strip blueprints.
2. Rewrite `grids.js` so the social actions become children of the `card-menu-spark` three-dot vessel, with a click-safe dropdown.
3. Rewrite `new-style.css` completely, preserving existing styles and adding card-menu dropdown/mobile-safe rules so no gray block bleeds over buttons.
4. Rewrite `layout.css` completely to stop fixed mobile scroll lock: desktop can keep its app-shell grid, but mobile must become document-flow, allow body scrolling, and keep sidebars non-overlapping.
5. Rewrite empty `sidebar.css` with explicit safe sidebar behavior for mobile and desktop.
6. Verify syntax/imports with Node static import checks where browser DOM does not need to run.

Rule: no partial patching. Every modified file is rewritten as a whole vessel.