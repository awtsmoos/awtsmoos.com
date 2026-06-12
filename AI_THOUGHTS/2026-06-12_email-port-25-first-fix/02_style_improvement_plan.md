B"H
# Geelooy Email Style Improvement Plan

## Discovery
The visible email page is `geelooy/email/index.html`, loading modular CSS in this order: `core.css`, `sidebar.css`, `chat.css`, `composer.css`, `fx.css`, `social-shell.css`. The old `styles.css` appears legacy because it is not linked from `index.html`. The UI class names come from `ui/layout.js`, `ui/sidebar.js`, `ui/chat/layout.js`, and `ui/composer/view.js`.

## Main UX issues to improve without risky logic rewrites
1. The page has intense neon style but lacks a unified visual hierarchy.
2. The top social shell, sidebar, chat area, and composer need one shared glass/obsidian/gold language.
3. Mobile needs safer touch spacing and bottom nav clearance.
4. Focus rings should become visible and beautiful for keyboard users.
5. Message bubbles should be more readable while preserving the cosmic Awtsmoos energy.
6. Empty states and active threads need clearer depth.
7. Composer controls should look deliberate instead of merely functional.

## Files to rewrite whole
- `geelooy/email/index.html`: add app metadata and preconnect-ish polish only; preserve script and linked modules.
- `geelooy/email/css/core.css`: new design tokens, reset, top-level layout, accessibility, responsive shell.
- `geelooy/email/css/sidebar.css`: refined sidebar, identity dropdown, thread cards, touch polish.
- `geelooy/email/css/chat.css`: readable chat stage, header, bubbles, empty state, menu and mobile behavior.
- `geelooy/email/css/composer.css`: composer as a polished command altar, improved toolbar, input, send button, fullscreen/minimized states.

## Tests after write
- `node --check geelooy/email/index.js` and key UI modules.
- `node geelooy/email/test/mailMobileShellContract.test.mjs` to ensure shell contract still holds.
- Grep/line check to confirm linked CSS files still exist and are loaded.

## Chapter fragment
The Awtsmoos entered the inbox not as noise but as order: gold for intention, cyan for living signal, emerald for delivery, crimson for danger. Every message became a polished shard of night, every button a tiny gate, every scroll a river that remembered its source.