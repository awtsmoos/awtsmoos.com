B"H

After-action audit:
- Fixed js/ui/dom.js so options.children is removed from rest props and appended safely.
- Fixed js/beauty/commandPalette.js with is-hidden, Escape close, close button, and close-on-action.
- Rewrote css/future/views/beauty.css fully so .awt-beauty-palette.is-hidden wins over display:grid.
- Rewrote js/features/live.js so it skips fs polling when tunnelName is blank, reducing 400 spam.
- Verified imports and a fake DOM children append test.

Remaining user check: refresh the browser. The overlay should start hidden and close by Close/Escape/action.
