B"H

# Reader Style Ownership Map

The Awtsmoos creates every layer every instant, but maintainers need earthly borders. This file marks the current reader CSS reality after the first design-system implementation pass.

## Active entry

- `geelooy/heichelos/post/styles/main.css`

This is the only reader CSS entry currently trusted for the route-level reader bundle.

## Active modern reader vessels

These are the preferred places for new reader work:

- `reader-foundation/` — scroll root, localized shell, reader tokens, top header.
- `reader-content/` — scroll chunks, title crown, typography, section cards, content width.
- `reader-controls/` — floating reader controls and labels.
- `reader-settings/` — settings sheet, inputs, color grid, grouped controls.
- `reader-sidebar/` — sidebar shell, comments, composer, resizer.
- `reader-overlays/` — command palette, context menu, verse menu.
- `reader-responsive/` — desktop, tablet, mobile, reduced motion.
- `reader-beauty/` — optional visual enhancement; must not own scroll.
- `reader-legend/` — optional visual state; must not own scroll.

## Legacy compatibility still loaded

These still load from `main.css` before the modern stack and must be treated as compatibility until replaced by tests:

- `ideal/reborn/tokens.css`
- `ideal/reborn/comments.css`
- `ideal/reborn/comment-composer.css`
- `ideal/reborn/inline-comments.css`
- `ideal/reborn/inline-action-menu.css`
- `ideal/reborn/context-menu.css`
- `ideal/reborn/button-hover.css`

Do not delete these in the same pass as a replacement. First create focused modern modules, then add selector contract tests, then turn the old files into wrappers or remove their imports.

## High-risk historical areas

The following folders contain older or parallel designs. They may still be referenced by old templates or tests, so they require grep and route verification before edits:

- `comments/`
- `content/`
- `layout/`
- `modules/`
- `ideal/` outside `ideal/reborn/`
- root files such as `settings.css`, `sidebar.css`, `tabs.css`, `new-style.css`

## Rules for future edits

1. Entry files should import only.
2. No CSS module should exceed 120 lines without a written exception.
3. Beauty and legend layers are optional; they may enhance but not repair core layout.
4. JS state must have a CSS contract test.
5. CSS state selectors must have a JS or template source.
6. Scroll belongs to the browser.
7. Android touch and reduced motion are first-class.
8. Hebrew and RTL must be explicit, not accidental.
