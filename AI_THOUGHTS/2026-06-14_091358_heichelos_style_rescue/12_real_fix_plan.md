B'H
# Real Fix Plan After Live Screenshots

Evidence: post reader server-side SyntaxError was caused by malformed template closing order in the loading segment. Local curl now shows no SyntaxError and the critical post reader CSS is present. Remaining visible regression is the Heichel/global menus: the global hamburger is too complex and the card menu is being overridden by older revamped CSS that turns an opened card menu into a fixed mobile bottom sheet.

Actual fixes:
1. Rewrite `templates/nav/header.html` to use a literal button with a simple global toggle function, no SVG template script dependency.
2. Rewrite `geelooy/style/heichelos/heichel/card-menu.css` to explicitly neutralize the older mobile fixed menu rules and anchor the menu to the card.
3. Add Node-side DOM/static tests for post reader HTML and menu contracts.
4. Start server in background, fetch the post reader route, verify no template errors.
5. Commit/push and leave `npm run bh` ready for user password deploy.
