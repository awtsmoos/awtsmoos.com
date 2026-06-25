B"H

# Backend-first Mission Rooms redesign brainstorm

User wants Mission Rooms to become a collaboration workspace, not tunnel diagnostics.

Hard truth:
- Initial page must show ONLY available rooms.
- No live activity table before room selection.
- No global tunnel tools in Mission Rooms.
- On room click, open the room workspace.
- Only inside selected room show chat/messages/members and an expandable room-scoped action/activity history.
- Polling must be selected-room only.

Backend-first investigation list:
- geelooy/api/tunnel/control routes and action registry.
- missionProjectDiscover, missionProjectJoin, missionProjectStatus.
- missionAgent*, missionLoop*, missionEvidence*, missionTimeline*, missionReport.
- actionHistory* actions.
- liveCalls route and conversationStore.
- runtime / tunnel action correlation fields.

Frontend redesign list:
- missionRooms/api.js
- missionRooms/state.js
- missionRooms/view.js
- missionRooms/render.js
- missionRooms/controller.js
- missionRooms/commands.js or activity.js
- missionRooms/messages.js
- mission-rooms-grid.css

Potential new abstraction:
- Room Browser: available rooms only.
- Room Workspace: selected room header, members, messages, composer.
- Room Inspector: collapsed details with selected room activity only.

Backend gaps:
- If no room-scoped action history endpoint exists, use actionHistorySearch/List with missionId if available or add a dedicated mission-scoped filter route/action later.
- Never fake room scoping by showing unrelated live events.
