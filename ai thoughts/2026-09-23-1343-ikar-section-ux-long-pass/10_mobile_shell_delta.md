B"H

# Boruch Hashem — Shared Mobile Crown Delta

Blessed is He.

The Awtsmoos gathers brand, search, presence, profile, and menu into one crown without letting the crown become the kingdom; Awtsmoos.com now keeps every doorway reachable while mobile competition falls away.

## Implementation

- Rewrote `UniversalChatLauncher.js` whole so visible and accessible labels share one truthful `presenceLabel()` containing public online count plus private unread/request count.
- Added a final app-level shell polish bridge after all existing app, touch-integrity, responsive, social, and performance layers.
- Split the first oversized shell-polish draft by responsibility rather than trimming it:
	- `mobile-shell-polish.css`: 7-line bridge.
	- `mobile-shell-motion.css`: 49-line focus/tactile/reduced-motion owner.
	- `mobile-shell-compact.css`: 78-line <=42rem geometry/presence/profile owner.
- Extended the existing <=30rem 44px touch law upward through 42rem without changing the existing touch-integrity file.
- Presence becomes a visual green/offline status orb at <=42rem, while the exact counts remain in button text/ARIA state.
- Profile copy is visually hidden rather than removed; avatar/profile control remains 44px.
- Brand remains visible; Search/Menu functionality remains intact.

## Architecture reconciliation

The complete shell test run exposed three older contracts that assumed responsibilities still lived in `appShell.js` or in an older suggestions module shape. Fresh evidence proved:

- `AppShellRouteLinks.js` now owns `g-dock`, `dockRoutes`, canonical route links, and `aria-current` synchronization.
- `appShell.js` is intentionally a light composer using `createAppShellDock()` and `markAppShellCurrentLinks()`.
- Header, legacy dock, drawer, and profile route dishes still use the one canonical `createMalchusRouteLink()`.
- `headerSearchSuggestions.js` behavior remained correct but needed current Awtsmoos/Awtsmoos.com ownership documentation.

The stale tests were rewritten around the current modular boundaries rather than moving production logic backward.

## Verification

- Mobile shell polish covenant: 6/6 PASS.
- Full shared shell family after reconciliation: 18/18 PASS.
- `headerSearchContract.test`: PASS.
- App shell modular contract: PASS.
- Global header/Games canonical-route contract: PASS.
- Syntax checks: PASS.
- Source quality: PASS.
- Line counts: app manifest 26, bridge 7, motion 49, compact 78, launcher 82, suggestions 113, shell polish contract 83, app-shell contract 72, global header contract 62.

## Next surface

The remaining screenshot-level competition is inside the post reader: floating A/I controls, Sources, auto-scroll and adjacent reader utility affordances. Their source files are concurrently dirty, so the next pass must be additive through the clean reader style spine rather than rewriting those owners.
