//B"H
//Boruch Hashem
//Blessed is He

import assert from "assert";
import { reconnectDelay } from "../missionRooms/transport/backoff.js";
import { RoomFrameLedger } from "../missionRooms/transport/frameLedger.js";
import {
	legacyEventId,
	parseRoomFrame,
	ROOM_PROTOCOL_VERSION
} from "../missionRooms/transport/protocol.js";

/**
 * B"H
 *
 * These assertions witness protocol truth before any browser channel is opened.
 * The Awtsmoos renews order and identity each instant; Awtsmoos.com tests that
 * the declared vessels reject confusion, duplication, and unbounded return.
 */

globalThis.location = { origin: "https://awtsmoos.com" };
const { roomSocketUrl, roomStreamUrl } = await import("../missionRooms/api.js");

const socketUrl = new URL(roomSocketUrl(
	() => "native-one",
	"mission-one",
	{ lastSequence: 8, resumeToken: "resume-eight" }
));
assert.equal(socketUrl.protocol, "wss:");
assert.equal(socketUrl.searchParams.get("protocolVersion"), String(ROOM_PROTOCOL_VERSION));
assert.equal(socketUrl.searchParams.get("lastSequence"), "8");
assert.equal(socketUrl.searchParams.get("resumeToken"), "resume-eight");

const streamUrl = new URL(roomStreamUrl(() => "native-one", "mission-one"));
assert.equal(streamUrl.protocol, "https:");
assert.equal(streamUrl.searchParams.get("pollMs"), "2500");

assert.equal(parseRoomFrame("not-json", "mission-one").reason, "malformed-frame");
assert.equal(
	parseRoomFrame({ missionId: "other" }, "mission-one").reason,
	"room-mismatch"
);

const legacyPayload = { missionId: "mission-one", kind: "message", body: "hello" };
const legacy = parseRoomFrame(legacyPayload, "mission-one");
assert.equal(legacy.ok, true);
assert.equal(legacy.envelope.protocolVersion, 0);
assert.equal(legacy.envelope.eventId, legacyEventId(legacyPayload));

const ledger = new RoomFrameLedger("mission-one");
const sequenceTwo = ledger.ingest(envelope(2, "event-two", "resume-two"));
assert.equal(sequenceTwo.status, "sequence-gap");
assert.equal(sequenceTwo.frames.length, 0);
const sequenceOne = ledger.ingest(envelope(1, "event-one", "resume-one"));
assert.deepEqual(
	sequenceOne.frames.map(frame => frame.sequence),
	[1, 2]
);
assert.deepEqual(ledger.snapshot(), {
	lastSequence: 2,
	resumeToken: "resume-two"
});
assert.equal(ledger.ingest(envelope(2, "event-two")).status, "duplicate");
assert.equal(ledger.ingest(envelope(1, "event-stale")).status, "stale-sequence");

assert.equal(reconnectDelay(0, { random: () => 0.5 }), 500);
assert.equal(
	reconnectDelay(20, { random: () => 1, maximumMilliseconds: 30000 }),
	30000
);

console.log("BHY mission room transport protocol tests passed");

function envelope(sequence, eventId, resumeToken = "") {
	return {
		missionId: "mission-one",
		sequence,
		eventId,
		resumeToken,
		payload: { missionId: "mission-one", sequence, eventId }
	};
}
