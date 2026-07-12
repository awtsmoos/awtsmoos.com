# B"H — Phase Three: Final File Manifest

## Chosen implementation
This pass is intentionally CSS-authoritative. The current HTML, UI builders, routes, store, profile dropdown, composer events, thread behavior, and API modules already expose the required semantic hooks. Rebuilding their logic would add regression risk without improving the verified visual problem.

## Files to rewrite completely

### Home spatial score
1. `geelooy/style/geelooy-app/home/hero/layout.css`
	- Two-column hero score on wide screens.
	- Compact vertical rhythm and hard edge coordinates.
2. `geelooy/style/geelooy-app/home/hero/orbit.css`
	- Smaller coordinate beacon with layered noncircular orbits.
3. `geelooy/style/geelooy-app/home/hero/actions.css`
	- Asymmetric command cluster and distinct primary Write portal.
4. `geelooy/style/geelooy-app/home/hero/portals.css`
	- Search lens and Torah source gate hierarchy.
5. `geelooy/style/geelooy-app/home/feed.css`
	- Transmission river spine, alternating cards, clearer metadata/actions.
6. `geelooy/style/geelooy-app/home/aside.css`
	- Unified signal tower and sharper route chambers.
7. `geelooy/style/geelooy-app/responsive/tablet.css`
	- Intentional collapse from spatial score to single river.
8. `geelooy/style/geelooy-app/responsive/mobile.css`
	- Compact hero, two-column commands, full-width feed, no horizontal drift.

### Quantum Mail instrument
9. `geelooy/email/css/quantum/core/frame.css`
	- Asymmetric outer deck, live coordinate rail, responsive shell dimensions.
10. `geelooy/email/css/quantum/sidebar/deck/frame.css`
	- Compressed identity crown and stronger deck boundary.
11. `geelooy/email/css/quantum/sidebar/deck/identity.css`
	- Identity frequency capsule and decisive compose transmitter.
12. `geelooy/email/css/quantum/sidebar/filters.css`
	- Compact search, sender frequencies, folder strip, mobile horizontal flow.
13. `geelooy/email/css/quantum/sidebar/threads/items.css`
	- Strong sender/subject/snippet/time scan hierarchy.
14. `geelooy/email/css/quantum/chat/deck/frame.css`
	- Deep conversation channel and readable message river.
15. `geelooy/email/css/quantum/chat/deck/header.css`
	- Active frequency lockup and obvious controls.
16. `geelooy/email/css/quantum/chat/deck/stream.css`
	- Charged truthful empty state.
17. `geelooy/email/css/quantum/chat/messages/bubbles.css`
	- Directional incoming/outgoing geometry.
18. `geelooy/email/css/quantum/composer/shell.css`
	- Focused transmission chamber with lower animation cost.
19. `geelooy/email/css/quantum/sidebar/threads/mobile.css`
	- Preserve safe sender-deck slide behavior.
20. `geelooy/email/css/quantum/chat/deck/mobile.css`
	- Preserve safe active-thread slide behavior and visible back control.
21. `geelooy/email/css/social-shell.css`
	- Mail-specific shared-header frequency treatment.
22. `geelooy/email/css/hypermail.css`
	- Final integration authority, reduced motion, disabled and sentiment states.

## Explicit nonchanges
- No route changes.
- No API changes.
- No authentication or alias mutation.
- No compose, delete, reply, search, folder, or thread logic changes.
- No fake content.
- No changes outside the listed Geelooy CSS files and planning artifacts.

## Verification matrix
1. CSS import resolution and line-count audit.
2. Existing Geelooy app quality contract.
3. Home live-feed contract.
4. Shared shell route contract.
5. Mail shared-shell contract.
6. Mail mobile-shell contract.
7. Mail syntax checks for existing JS entry/UI files.
8. Safe local HTTP GET checks for Home and Mail.
9. Fresh Chrome Home desktop 1440×1000 audit.
10. Fresh Chrome Home mobile 390×844 audit.
11. Fresh Chrome Mail desktop 1440×1000 audit.
12. Fresh Chrome Mail mobile 390×844 audit.
13. Dead-link and horizontal-overflow audit.
14. Safe interaction audit: Home search focus/menu/profile; Mail compose open-close, folder selection, search field, and mobile deck/thread affordances without submitting or deleting.
15. Readback of every rewritten file.
16. Planned-versus-actual delta report.

## Completion standard
The pass is complete only when the measured Home hero is materially shorter, the mobile feed begins earlier, Mail remains overflow-free, contract tests pass, safe interactions remain available, and the visual system reads as one Geelooy constellation rather than a stack of generic cards.