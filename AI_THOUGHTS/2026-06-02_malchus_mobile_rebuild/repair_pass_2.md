B"H
# Repair Pass 2 — Scroll and Missing Panel Style

New screenshots after the CSS rebuild show:

1. The sidebar did load the new dark shell, but panel interiors are still missing exact styles:
   - student rows are dark outside but inner buttons/toggles are default white blocks.
   - the comments panel and students panel can both become visible, so hidden panels need stricter rules and JS should not depend only on ambiguous browser `hidden` behavior.
   - comment editor buttons are default browser controls.
2. The main reader still does not scroll reliably.
   - CSS says the reader should scroll, so the likely remaining problem is an ancestor/body style, virtual chunk geometry, or route/global layout outside imported CSS.
   - Fix must use both CSS hard guarantees and a small JS scroll covenant at boot.

Inspected real files:
- `comments/panel/rendering.js`
- `comments/panel/rendering/KeeperRowFactory.js`
- `CommentSection.js`
- `commentSection/editorUi.js`
- `comments/render/factories/SidebarCardFactory.js`
- `logic/scribe.js`
- `logic/scribe/Scaffold.js`
- `logic/scribe/VirtualScrollOracle.js`
- `postLogic.js`
- `styles/ideal/reborn/*.css`

Fix plan:
1. Rewrite `panels.css` fully to style the actual classes seen in the DOM: keeper rows, keeper buttons, inline toggles, comment editor altar, action sections, favorites, search, tabs.
2. Rewrite `shell.css` fully to force page/document scroll and remove all fixed-height traps.
3. Rewrite `reader.css` fully to guarantee virtual chunk/reader geometry and enough bottom space.
4. Rewrite `actions.css` fully so A/I/Scroll are always below reading content and never inside the sidebar visual layer.
5. Rewrite `comments/panel/rendering.js` fully with explicit `.is-current-panel` class toggling in addition to `hidden`, so only one internal sidebar panel can show.
6. Rewrite `postLogic.js` fully to install a tiny scroll-repair covenant before ignition: body/html/root overflow visible, document scroll enabled, and runtime correction after boot.
7. Verify CSS imports/braces, JS syntax, CSS quality, imported ownership, and targeted static checks.

No partial patching. Every modified file is rewritten whole.
