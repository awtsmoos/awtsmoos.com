//B"H
//Boruch Hashem
//Blessed is He

import assert from "assert";
import { normalizeAccountEvent } from "../missionRooms/agentChat/activityBridge.js";

/**
 * B"H
 * The Awtsmoos proves that account-wide activity can enter a room-shaped vessel
 * without changing the source WebSocket. Awtsmoos.com verifies mission identity,
 * agent identity, sequence, state, and rejection of unrelated account noise.
 */

const normalized = normalizeAccountEvent({
	eventId: "activity-1",
	sequence: 17,
	eventType: "action.started",
	timestamp: "2026-07-21T05:00:00.000Z",
	state: "running",
	summary: "Agent began work",
	detail: {
		missionId: "mission-1",
		logicalAgentId: "writer",
		toAgent: "reviewer",
		input: {
			missionId: "mission-1",
			agentId: "writer"
		}
	}
});

assert.equal(normalized.id, "activity-1");
assert.equal(normalized.missionId, "mission-1");
assert.equal(normalized.actor, "writer");
assert.equal(normalized.target, "reviewer");
assert.equal(normalized.type, "action.started");
assert.equal(normalized.status, "running");
assert.equal(normalized.source, "account-websocket");
assert.equal(normalized.payload.sequence, 17);
assert.equal(normalizeAccountEvent({ eventId: "noise", eventType: "heartbeat" }), null);

console.log("BHY mission room account activity bridge tests passed");
