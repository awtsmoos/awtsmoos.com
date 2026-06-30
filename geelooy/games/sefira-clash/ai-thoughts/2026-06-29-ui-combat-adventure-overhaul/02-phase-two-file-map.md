# B'H — Phase Two File Map

Files to inspect before writing:

- `index.html`
- `css/base.css`
- `css/menu.css`
- `css/touch.css`
- `style.css`
- `js/menu/menuViews.js`
- `js/menu/domForge.js`
- `js/controls/touchButtons.js`
- `js/data/adventure/adventureFactory.js`
- `js/data/adventure/adventureLevels.js`
- `js/session/sessionHelpers.js`
- `js/main.js`

Likely files to rewrite fully:

- `css/menu.css` for stronger, simpler, more legible navigation.
- `css/touch.css` for larger mobile buttons.
- `js/menu/menuViews.js` if buttons are generated there.
- New smaller menu modules if `menuViews.js` is doing too much.
- `js/controls/touchButtons.js` if action buttons are too complex or unclear.

No partial replacement will be used. Any touched file becomes a full-file rewrite.
