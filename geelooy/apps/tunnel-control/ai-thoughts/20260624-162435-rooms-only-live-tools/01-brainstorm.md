B"H

# Rooms-only + room-scoped live tool stream

User correction: Mission Rooms should not show every tunnel tool as a huge global grid. It should show available rooms only. When a room is opened, show room details, message composer, and a live stream/table of the tools/actions that agents in that room are calling to the tunnel. Need inspect routes to use actual backend capabilities.

Essential UI:
- Mission Rooms page top: available rooms grid/list only.
- Each room card: mission id/goal, agents, open user messages, status.
- Open room: selected room panel with messages + composer.
- Room tool calls: table/list scoped to missionId/room/conversation if live-calls supports filter/group.
- No global tool codex in Mission Rooms. Tool Codex remains separate Usage page.

Potential source endpoints:
- /api/tunnel/control/live-calls with filter and groupBy conversation.
- protected fs route action history maybe actionHistorySearch/List via tunnel action.
- missionProjectStatus may contain collaboration messages/agents/currentAction.

Implementation likely:
- js/features/missionRooms/view.js remove tool filter, tool panel, refresh tools button.
- js/features/missionRooms/controller.js remove docsCatalog/tools; refreshCommands uses liveCalls(selectedMissionId || projectRoot), derive rows from room messages + live events.
- js/features/missionRooms/render.js remove renderTools; improve renderCommands to say Room tunnel calls.
- js/features/missionRooms/api.js remove docsCatalog export.
- js/features/missionRooms/state.js remove tools/toolFilter.
- css/future/views/mission-rooms-grid.css remove huge tool card grid; style command table.
- tests update if needed.
