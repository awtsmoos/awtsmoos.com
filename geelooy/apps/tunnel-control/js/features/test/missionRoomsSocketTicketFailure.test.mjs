//B"H
//Boruch Hashem
//Blessed is He

import assert from "assert";
import {
	createFakeScheduler,
	FakeEventSource,
	FakeWebSocket,
	resetTransportFakes
} from "./missionRoomsTransportFakes.mjs";

/**
 * B"H
 *
 * A denied ticket must remain a visible denial. The Awtsmoos recreates failure
 * and recovery without contradiction; Awtsmoos.com falls back to the patient
 * stream and never paints an unauthenticated socket green.
 */

globalThis.location = { origin: "https://awtsmoos.com" };
const { openRoomSocket, closeRoomSocket } = await import(
	"../missionRooms/socket.js"
);

resetTransportFakes();
const scheduler = createFakeScheduler();
const diagnostics = [];
const state = {
	selectedMissionId: "mission-denied",
	socketMode: "idle",
	transportAttempt: 0,
	transportDiagnostics: null
};

openRoomSocket(state, () => "native-one", {
	onDiagnostic: record => diagnostics.push(record)
}, {
	WebSocketClass: FakeWebSocket,
	EventSourceClass: FakeEventSource,
	requestSocketTicket: async () => ({
		ok: false,
		error: "ticket_denied"
	}),
	setTimer: scheduler.setTimer,
	clearTimer: scheduler.clearTimer,
	random: () => 0.5,
	clock: () => Date.parse("2026-07-13T09:00:00.000Z")
});
await flush();

assert.equal(FakeWebSocket.instances.length, 0);
assert.equal(FakeEventSource.instances.length, 1);
assert.equal(state.socketMode, "eventsource");
assert.equal(scheduler.count(), 1);
assert(diagnostics.some(record => (
	record.code === "websocket-ticket-failed"
)));
assert.equal(
	state.transportDiagnostics.lastCode,
	"reconnect-scheduled"
);

closeRoomSocket(state);
assert.equal(state.socketMode, "idle");
assert.equal(scheduler.count(), 0);
console.log("BHY mission room ticket failure fallback passed");

function flush() {
	return new Promise(resolve => setTimeout(resolve, 0));
}