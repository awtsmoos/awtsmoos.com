B"H

# Pass 2 Plan

Possible implementation nodes:
- Add a frontend API call in Mission Rooms controller to fetch action/tool schema/catalog from tunnel docs/OpenAPI or action list endpoint.
- Render tools in Mission Rooms as searchable categorized cards/table.
- Render agent tunnel command table from mission room messages/actions/history if present. If backend exposes action history per tunnel, use it; otherwise derive from messages containing action/requestAction/actualAction.
- Improve Live view to organize event stream by current chat/session/mission id, grouping rows and adding readable command/action chips.

Files likely to touch after inspection:
- js/features/missionRooms/api.js
- js/features/missionRooms/state.js
- js/features/missionRooms/render.js
- js/features/missionRooms/view.js
- js/features/missionRooms/controller.js
- css/future/views/mission-rooms-grid.css
- js/features/live.js or live submodules if split is needed
- css/future/views/live.css

Verification:
- node --check changed JS.
- Existing feature tests.
- Browser DOM eval for mission rooms selectors.
