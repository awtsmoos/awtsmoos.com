// B"H
import assert from "assert";

global.location = { origin: "https://awtsmoos.com" };
const { roomSocketUrl, roomStreamUrl } = await import("../missionRooms/api.js");
const { openRoomSocket, closeRoomSocket } = await import("../missionRooms/socket.js");

assert(roomSocketUrl(() => "tun", "m1").startsWith("wss://awtsmoos.com/api/tunnel/control/mission-room/ws"));
assert(roomStreamUrl(() => "tun", "m1").startsWith("https://awtsmoos.com/api/tunnel/control/mission-room/stream"));

let frames = 0, statuses = 0, closed = 0;
class FakeWebSocket {
  constructor(url) { this.url = url; setTimeout(() => this.onopen?.(), 0); }
  close() { closed += 1; }
  emit(data) { this.onmessage?.({ data: JSON.stringify(data) }); }
}
global.WebSocket = FakeWebSocket;
const state = { selectedMissionId: "m1", socket: null, eventSource: null, socketMode: "idle", socketReconnect: 0 };
openRoomSocket(state, () => "tun", { onFrame: () => frames += 1, onStatus: () => statuses += 1 });
assert(state.socket, "socket created");
state.socket.emit({ missionId: "m2", type: "wrong-room" });
state.socket.emit({ missionId: "m1", type: "right-room" });
assert.equal(frames, 1);
closeRoomSocket(state);
assert.equal(state.socket, null);
assert(closed >= 1);
console.log("BHY mission room socket tests passed");
