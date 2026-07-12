# B"H — Phase Two: Improve the Recovery Before Writing

## Twenty-five improvements over the first brainstorm
1. Do not merely restyle the new rail; delete the rail concept from the shared shell.
2. Reuse the historic header class name so old mental and visual continuity is explicit.
3. Keep the current modular profile API logic rather than restoring the old monolithic script.
4. Restore the old search proportions and animated orb, then add real suggestions instead of decorative animation only.
5. Make the header search submit to `/heichelos?q=...` while route suggestions remain native links.
6. Give Torah search a dedicated persistent result inside the suggestions sheet.
7. Use one menu button and one profile dropdown; do not create duplicate drawers.
8. Remove Games from the primary menu because the user excluded games from this project.
9. Keep Mail directly visible in the header at all desktop widths.
10. Use a single palette for the social shell and reserve gold for Mail.
11. Replace generic emoji where a geometric CSS icon can carry the futuristic identity.
12. Add dynamic background depth through pseudo-elements, not heavy canvas on every page.
13. Keep page cards readable with dark opaque cores; glass must never destroy contrast.
14. Raise Home visual ambition through asymmetry, scale, and depth rather than more unrelated colors.
15. Restore the old search CSS as a source, not an untouchable exact copy; fix its compressed code and accessibility.
16. Keep mobile header compact and make the center search collapse into a search portal button.
17. Keep the mobile bottom dock but align its materials with the unusual header.
18. Remove the Mail-internal topbar and bottom nav to prevent double navigation.
19. Restore the Quantum Mail SVG goo filter in Email HTML because old CSS and effects reference it.
20. Use the current sender-group/folder architecture, not the December data model.
21. Rewrite Email CSS around current actual class names discovered from source.
22. Make Email functional states obvious: loading, no alias, empty inbox, active thread, compose validation, API error.
23. Remove the blocking 500ms spin in `switchChat`; use a 200ms transition and render errors visibly.
24. Test Email with authenticated browser state: folders, categories, search, thread opening, composer open/close, profile menu, and safe GET APIs.
25. Capture final desktop/mobile screenshots of Home, header dropdown/search, and Email.

## Revised architecture graph

```text
Canonical routes
	↓
UnusualHeader.js ── ProfileDropdown mount
	├── B"H jewel
	├── old-search-derived portal
	├── Mail portal
	└── route constellation menu
	↓
Shared shell boot
	├── native navigation prefetch
	├── mobile dock
	└── body/background activation

Home
	├── cinematic hero
	├── old-search-derived large lens
	├── real feed
	└── vivid route/action modules

Email
	├── global unusual header
	├── quantum communications frame
	│	├── sender/folder sidebar
	│	├── active thread
	│	└── holographic composer
	├── existing APIs/store
	└── fast non-blocking transitions
```

## Files intended for full rewrite
- `scripts/awtsmoos/social/shell/appShell.js`
- `scripts/awtsmoos/social/shell/appCommand.js`
- `scripts/awtsmoos/social/shell/boot.js`
- Shared shell/header/search CSS modules.
- `index.html`
- Home hero/feed/aside CSS modules.
- Profile-dropdown visual CSS modules.
- `email/index.html`
- `email/ui/layout.js`
- `email/ui/chat.js`
- `email/css/core.css`
- `email/css/sidebar.css`
- `email/css/chat.css`
- `email/css/composer.css`
- `email/css/fx.css`
- `email/css/social-shell.css`
- `email/css/hypermail.css`

## New modules likely required
- `scripts/awtsmoos/social/shell/unusualHeader.js`
- `scripts/awtsmoos/social/shell/headerSearch.js`
- `style/geelooy-app/header/index.css`
- `style/geelooy-app/header/shell.css`
- `style/geelooy-app/header/search.css`
- `style/geelooy-app/header/menu.css`
- `style/geelooy-app/header/mobile.css`
- Small Email CSS modules if any rewritten file would exceed the source budget.
