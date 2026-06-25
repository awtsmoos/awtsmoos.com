B"H

# WebSocket-based Mission Rooms brainstorm

User wants coding now, WebSocket based. Goal: selected Mission Room should receive live room updates without global live-call leakage.

Need inspect existing websocket infrastructure:
- live calls websocket route/client.
- any tunnel control websocket/event bus.
- mission action backend can emit events? If not, frontend can websocket subscribe to a room-specific stream if route exists, otherwise add a route backed by polling/missionTimeline server-side later.

Desired architecture:
1. Lobby loads rooms via `missionProjectDiscover` once and can refresh.
2. Clicking room joins it and opens workspace.
3. Client opens a WebSocket scoped to selected missionId.
4. WebSocket events accepted only if event.missionId === selectedMissionId or route is already scoped.
5. On event: refresh status/timeline, or apply incremental event payload.
6. Switching rooms closes old socket and opens new one.
7. Hidden tab pauses/reconnects safely.
8. No websocket starts before room selection.

Potential files:
- js/features/missionRooms/socket.js new
- js/features/missionRooms/controller.js rewrite to use socket lifecycle
- js/features/missionRooms/api.js add room socket URL helper
- js/features/missionRooms/state.js add socket fields
- maybe backend route under geelooy/api/tunnel/control/routes/missionRoomStream.js if no route exists
- maybe app main route registration file if needed
