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
import {
	createRoomFrame,
	createRoomState,
	flushTransport
} from "./missionRoomsSocketFixtures.mjs";

/**
 * B"H
 *
 * A raw opening cannot counterfeit a living room. The Awtsmoos renews ticket,
 * frame, failure, and recovery; Awtsmoos.com proves readiness only when a valid
 * mission envelope arrives, while order and fallback remain unbroken.
 */

globalThis.location = { origin: "https://awtsmoos.com" };
const { openRoomSocket, closeRoomSocket } = await import(
	"../missionRooms/socket.js"
);

resetTransportFakes();
const scheduler = createFakeScheduler();
const frames = [];
const statuses = [];
const diagnostics = [];
let ticketNumber = 0;
const state = createRoomState();
const dependencies = {
	WebSocketClass: FakeWebSocket,
	EventSourceClass: FakeEventSource,
	requestSocketTicket: async () => ({
		ok: true,
		ticket: `ticket-${++ticketNumber}`
	}),
	setTimer: scheduler.setTimer,
	clearTimer: scheduler.clearTimer,
	random: () => 0.5,
	clock: () => Date.parse("2026-07-13T09:00:00.000Z")
};

openRoomSocket(state, () => "native-one", {
	onFrame: frame => frames.push(frame),
	onStatus: () => statuses.push(state.socketMode),
	onDiagnostic: record => diagnostics.push(record)
}, dependencies);
await flushTransport();

const firstSocket = FakeWebSocket.instances.at(-1);
assert(firstSocket.url.includes("protocolVersion=1"));
assert(firstSocket.url.includes("ticket=ticket-1"));
assert.equal(state.socketMode, "connecting");
firstSocket.open();
assert.equal(state.socketMode, "connecting");
firstSocket.emit(createRoomFrame(2, "event-two"));
assert.equal(state.socketMode, "websocket");
assert.equal(frames.length, 0);
firstSocket.emit(createRoomFrame(1, "event-one"));
assert.deepEqual(frames.map(entry => entry.sequence), [1, 2]);
firstSocket.emit(createRoomFrame(2, "event-two"));
assert.equal(frames.length, 2);
firstSocket.emit("broken-json");
assert.equal(
	state.transportDiagnostics.counters["frame-malformed-frame"],
	1
);

firstSocket.disconnect();
assert.equal(state.socketMode, "eventsource");
assert.equal(scheduler.count(), 1);
const source = FakeEventSource.instances.at(-1);
source.open();
source.emit(createRoomFrame(3, "event-three"), "snapshot");
assert.deepEqual(frames.map(entry => entry.sequence), [1, 2, 3]);

assert.equal(scheduler.runNext(), 500);
await flushTransport();
const recoveredSocket = FakeWebSocket.instances.at(-1);
assert.notEqual(recoveredSocket, firstSocket);
assert(recoveredSocket.url.includes("lastSequence=3"));
assert(recoveredSocket.url.includes("ticket=ticket-2"));
recoveredSocket.open();
assert.equal(state.socketMode, "eventsource");
assert.equal(source.closed, false);
recoveredSocket.emit(createRoomFrame(4, "event-four"));
assert.equal(state.socketMode, "websocket");
assert.equal(source.closed, true);
assert.equal(scheduler.count(), 0);

closeRoomSocket(state);
assert.equal(state.socketMode, "idle");
assert.equal(state.socket, null);
assert.equal(state.eventSource, null);
assert.equal(state.roomTransport, null);
assert(diagnostics.length > 5);
assert(statuses.includes("eventsource"));
console.log("BHY mission room socket recovery tests passed");
