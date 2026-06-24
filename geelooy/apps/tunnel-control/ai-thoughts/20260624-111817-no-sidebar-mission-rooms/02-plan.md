B"H

# Pass 2 Plan

Files to rewrite entirely:
1. js/boot/init.js
   - Remove beauty layer import and mount call.
   - Keep pointer field, card tilt, shell, repair, polling.
   - Update chapter comment to say beauty is now background-only/no rail.

2. css/future/views/shell.css
   - Rewrite under 120 lines.
   - Make shell a single column, no side panel layout.
   - Hide .awt-control-side and .awt-side-tabs globally inside shell.
   - Make .awt-control-main the scroll owner with safe full-page flow.

3. css/future/views/mission-control-os.css
   - Rewrite under 120 lines.
   - Remove body.awt-home-mode overflow hidden.
   - Allow page and main content to scroll normally.
   - Keep card grid responsive and non-overlapping.

4. css/future/views/mission-rooms-grid.css
   - Rewrite under 120 lines.
   - Replace sidebar-style two-column list with full-width auto-fit room cards.
   - Make selected room area flow below with controlled message scrolling.

5. js/features/missionRooms/view.js
   - Rewrite full file.
   - Replace aside with section/div room grid.
   - Make JSON collapsed details instead of always taking large space.

6. js/features/missionRooms/controller.js
   - Rewrite full file.
   - Auto-discover on boot and on interval with refreshRoomList.
   - Preserve selected room when possible.
   - Refresh selected room heartbeat/status.

7. css/future/views/no-side-rails.css
   - Rewrite full file as final defensive kill switch for side rails/drawers/beauty layer.
   - Scope to body.awt-no-side-rails and home/room grids.

Verification plan:
- Run npm test or available test scripts if package exists nearby.
- Run syntax check via node --check on changed JS files.
- Read back all changed files.
- Use browser snapshot if available to ensure no beauty layer or side panels remain.
