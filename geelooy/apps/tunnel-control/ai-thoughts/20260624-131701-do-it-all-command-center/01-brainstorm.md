B"H

# Do it all brainstorm

The user asked to do it all. The best implementation is a real hierarchy pass, not random churn:
- Dashboard has CORE COMMAND CENTER first.
- Advanced systems are hidden behind collapsible details.
- Mission Rooms is visually first and dominant.
- Live Commands, Project Explorer, Tool Codex, Root/Permissions, Obedience Monitor are core.
- All legacy/advanced pages remain reachable.
- No sidebars, no floating UI, normal page scroll.
- Files stay small and fully rewritten only.

Touch set now:
- js/dashboard/dashboard.js
- js/dashboard/dashboardCard.js
- css/final-normal-scroll.css
- js/shell/pageSpecs.js only if needed after readback
- tests if assertions fail

Plan to preserve behavior:
- Filter DASHBOARD_ORDER into core and advanced by badges.
- Render core grid plus details advanced grid.
- Add data attributes on cards for core/advanced and key.
- CSS makes missionRooms larger and advanced collapsed.
- Verify syntax and tests.
