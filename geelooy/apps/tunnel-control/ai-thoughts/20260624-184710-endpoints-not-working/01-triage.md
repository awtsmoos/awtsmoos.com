B"H

# Triage: rooms not loading / endpoints not working

Observed from user screenshots:
- Mission room lobby says loading available rooms forever.
- Old selected room UI and global room tunnel calls table still appears in one screenshot, likely stale bundle/cache or old tab.
- Console spam shows `configGet` calls, not missionProjectDiscover, indicating either pane not mounted correctly, route activation issue, or missionRooms controller not firing/throwing early.
- Live page websocket says connected but 0 frames; separate issue.

Immediate proof tasks:
1. Browser eval for console errors and DOM state.
2. Manual FS endpoint call for missionProjectDiscover from browser context.
3. Native tunnel action call for missionProjectDiscover from tool side.
4. Inspect controller after latest changes for missing button/element assumptions.
5. Fix endpoint payload / mount issue, then verify room cards or explicit empty state.
