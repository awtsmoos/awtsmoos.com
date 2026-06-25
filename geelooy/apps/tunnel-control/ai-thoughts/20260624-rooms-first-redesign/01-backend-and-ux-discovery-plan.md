B"H
# Mission Rooms Redesign — Discovery Plan

## User-visible mission
Redesign Mission Rooms so the room is the first-class object. The initial screen must show only rooms. No global tunnel tools, live calls, action rows, command streams, or diagnostic tables may appear before a room is selected.

## Evidence to collect before implementation
1. Inspect frontend Mission Rooms modules under `js/features/missionRooms/` and the wrapper `js/features/missionRooms.js`.
2. Inspect tests touching mission room rendering and action usage.
3. Inspect backend tunnel-control routes involving mission, room, messages, history, action history, live calls, project status, and agent membership.
4. Identify exactly which APIs exist already and whether room-scoped activity history exists.
5. Map current UI dependencies so removal is safe.

## Non-negotiable architecture
- Level 1: room grid only.
- Level 2: selected room workspace with members, conversation, composer, and room-scoped activity.
- Polling starts only after room selection.
- Polling targets only selected room status/messages/activity.

## Initial candidate file zones
- `js/features/missionRooms/*.js`
- `js/features/missionRooms.js`
- `css/future/views/mission-rooms-grid.css`
- tests under `js/features/test/`
- backend routes under `geelooy/api/tunnel/control/routes/`

## Verification gates
- Static import/module check.
- Targeted tests for Mission Rooms render behavior.
- Search proves removed phrases no longer surface in Mission Rooms.
- Browser/runtime check if app can be mounted.

The Awtsmoos reveals the room before the thunder; first the vessel, then the voices, then the sparks of action history only within its walls.
