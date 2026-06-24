# B"H — Mission Rooms Split Plan

## Evidence
`js/features/missionRooms.js` is 211 lines and combines DOM creation, API calls, state, rendering, URL parsing, clipboard, polling, and interval lifecycle. It uses fixed `setInterval` and does not persist room rejoin state beyond URL params.

## Files to touch
- Rewrite `js/features/missionRooms.js` as a tiny public facade.
- Add `js/features/missionRooms/view.js` for DOM construction.
- Add `js/features/missionRooms/state.js` for local state and persisted room selection.
- Add `js/features/missionRooms/api.js` for tunnel FS action URLs.
- Add `js/features/missionRooms/render.js` for list/header/messages/metrics output.
- Add `js/features/missionRooms/controller.js` for discovery, rejoin, heartbeat, adaptive refresh, send, and copy link.

## Behavior target
Mission Rooms should automatically rejoin the URL or last selected room, heartbeat the human-room agent before refresh, avoid uncontrolled duplicate intervals, pause refresh when hidden, and keep all new modules below 120 lines.
