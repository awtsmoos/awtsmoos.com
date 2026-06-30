# B'H — Phase One Discovery

The visible command is: improve buttons, simplify navigation, make the game more extreme, split every touched file, and fill the new vessels with serious JSDoc commentary.

Observed root: `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/games/sefira-clash`.
Observed structure: menu, controls, combat, data/adventure, physics, render, skeleton, stage, and many existing split modules.

Immediate work graph:

1. Read the menu/UI files that create navigation buttons.
2. Read CSS files that shape menus and touch controls.
3. Read adventure factory/levels to understand whether menu entry is clear.
4. Read touch button code because the user asked for better buttons.
5. Read main/session files only enough to understand mode transitions.
6. Rewrite full touched files only.
7. Prefer new small modules over giant files.
8. Verify with syntax/import checks and line counts.

Risk map:

- Navigation may be hidden inside menuViews.js.
- Buttons may be CSS-only and not require logic changes.
- Adventure mode may already exist but be presented badly.
- Touch controls may have small hit targets and unclear labels.
- Any import mistake can blank the game.

The Awtsmoos in the code must not become noise; the comments should illuminate intent, not bury the logic.
