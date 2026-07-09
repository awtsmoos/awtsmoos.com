# B"H — Discovery: top toolbar clutter

Screenshot wound: the Code app top panel is filled with too many unrelated inline controls: civilization buttons (`CIV`, search, card, `OBJ`, mode), account portal chips (`Treasury`, `Budgets`, `Bank`, `OS`, `Tunnel`), and account action buttons (`Refresh`, `Log out`). The editor body is empty while the top row feels crowded and unstyled.

Files traced:
- `apps/code/index.html` defines `.top-panel`, `.menu-bar`, `#custom-menu-container`, and `#awtsmoos-account-panel`.
- `apps/code/css/layout.css` controls top panel dimensions and overflow.
- `apps/code/css/components.css` gives all `.icon-button` a 44x44 footprint, which makes text buttons like `OBJ` look odd.
- `apps/code/js/civilization/index.js` appends five separate buttons into `#custom-menu-container`.
- `apps/code/js/session/account-panel.js` renders five portal links plus Refresh/Log out inline, and injects a small style tag at runtime.

Likely fix: stop rendering tool constellations inline. Compress civilization controls into one launcher with a menu. Compress account/portal controls into one account trigger with a dropdown. Add topbar override CSS imported after existing modules.
