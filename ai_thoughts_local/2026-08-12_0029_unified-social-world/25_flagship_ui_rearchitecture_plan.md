B"H

Boruch Hashem

Blessed is He

# Flagship UI / UX Rearchitecture Plan

The Awtsmoos is one before rail, list, thread, source card, or mobile sheet; Awtsmoos.com must make that unity felt as an effortless social-learning workspace rather than a collection of functional developer panels.

## Measured defects from the real 1440x960 browser
- Workspace height: ~1153px inside a 960px viewport.
- Search control height: ~1000px because six list-pane children occupy a grid declaring only three rows.
- Rail width: 180px, while its icon-first behavior collapses abruptly to 88px on tablet.
- Ten navigation buttons use mixed emoji/glyph iconography and each consumes ~53px vertically.
- Public Torah main workspace embeds a component still visually presented as a drawer, including a close button and app-deep-link inside the flagship itself.
- List rows are floating rounded cards rather than dense communication rows.
- Main private-thread empty state has almost no hierarchy or actionable context.
- Mobile layout is governed by two competing <=760px CSS systems.
- Special panes are visually sparse and do not share one consistent workspace header/card grammar.

## Pass 1 — Structural geometry
1. Rewrite `layout.css` so the app is exactly the visual viewport: `100dvh`, `min-height:0`, no document-level overflow.
2. Give list pane explicit rows for header, presence, search, reconnect, status, and scrollable content.
3. Narrow desktop rail to ~112px while preserving readable labels; tablet to ~82px; mobile becomes bottom navigation only.
4. Make list/thread/special/details scroll internally, never by stretching the app.
5. Remove conflicting <=760 rules from `responsive.css`; `mobile-workspace.css` becomes the single mobile layout owner.

## Pass 2 — Navigation and shell identity
1. Add `MessagingIcon.js` with one consistent SVG line-icon family.
2. Change section catalog icons from emoji to semantic icon names.
3. Rewrite `MessagingAppShell.js` to render SVG icons and a compact Awtsmoos brand mark.
4. Improve active, hover, focus-visible, and unread navigation affordances without using color alone.
5. Make alias identity compact but visually useful at the rail bottom.

## Pass 3 — Communication rows and empty states
1. Rewrite `MessagingRowFactory.js` to add avatar mark and structured copy/meta slots while preserving safe text and keyboard behavior.
2. Rewrite `MessagingListView.js` so conversation rows show title, preview, unread, and stable density.
3. Add a reusable `MessagingEmptyState.js` for icon/title/body/action composition.
4. Upgrade signed-out, empty private thread, Mail, and simple special panes with useful next actions rather than isolated paragraphs.

## Pass 4 — Public Torah as flagship-native workspace
1. Add `public-torah.css`, scoped only under `#messagingSpecialPane`.
2. Restyle `.universal-chat-drawer` as a full native surface: no floating drawer border/shadow metaphor.
3. Hide the redundant close button and "Open Universal Chat app" link only inside the flagship shell.
4. Create strong hierarchy: context/presence bar -> chronological source discussion -> source search/composer.
5. Keep every protocol, source session, source selection, and publish control unchanged.

## Pass 5 — Special chambers
- Activity becomes a clean timeline with visual event markers.
- Discover becomes an editorial grid with stronger type/reason hierarchy.
- Online becomes a presence dashboard with count emphasis and alias chips.
- Settings rows become obvious labeled controls with privacy explanation.

## Pass 6 — Mobile
- One bottom navigation rail with horizontal access to all sections.
- List/special/thread use one screen at a time.
- Sticky thread header/composer; back button only in thread/special context.
- Safe-area padding and >=44px controls.
- Public Torah search/publish controls stack cleanly at 430/390/360px.

## Exact first-write files
- `MessagingIcon.js` (new)
- `MessagingSectionCatalog.js`
- `MessagingAppShell.js`
- `MessagingShellTemplate.js`
- `MessagingEmptyState.js` (new)
- `MessagingRowFactory.js`
- `MessagingListView.js`
- `MessagingThreadView.js`
- `MessagingSpecialView.js`
- `layout.css`
- `workspace.css`
- `list.css`
- `thread.css`
- `components.css`
- `responsive.css`
- `mobile-workspace.css`
- `public-torah.css` (new)
- `style.css`

## Evidence gate
After full-file writes:
- all source/CSS <=120 lines;
- syntax/import closure/diff checks;
- 1440, 900, 768, 640, 430, 390, 360 real browser geometry;
- exact app height equals viewport; search ~40–48px; no document overflow;
- one social physical WebSocket remains;
- signed-out Public Torah remains functional;
- keyboard navigation and `aria-current` remain true;
- screenshot/DOM review of desktop and mobile before the next visual pass.

## NEXT_ACTION
Read style import order, then perform Passes 1–4 as full-file rewrites before testing geometry and visual hierarchy in Chrome.
