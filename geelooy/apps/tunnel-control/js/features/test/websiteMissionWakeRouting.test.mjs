// B"H
import assert from "node:assert/strict";

const memory = new Map();
global.localStorage = {
	getItem(key) { return memory.get(key) || null; },
	setItem(key, value) { memory.set(key, String(value)); }
};
global.document = {
	getElementById(id) {
		return id === "roomAgentId" ? { value: "control-room-human" } : null;
	}
};

const Registry = await import("../websiteMissionRegistry.js");
const { messagePayload } = await import("../missionRooms/messages.js");
const { directAgentMessagePayload } = await import("../missionRooms/agentChat/model.js");

Registry.clearWebsiteMissionRegistry();
Registry.rememberWebsiteMissions([{
	id: "webmission-visible",
	missionId: "mission-visible",
	status: "running"
}]);

assert.equal(
	Registry.websiteMissionIdFor("mission-visible"),
	"webmission-visible"
);
assert.equal(
	JSON.parse(memory.get("awt.websiteMissionRoomMap.v1"))["mission-visible"].websiteMissionId,
	"webmission-visible"
);

const room = messagePayload(
	"mission-visible",
	"Share progress and continue.",
	false,
	true
);
assert.equal(room.action, "websiteAgentMissionMessage");
assert.equal(room.websiteMissionId, "webmission-visible");
assert.equal(room.toAgent, "all");
assert.equal(room.allowContinue, true);

const direct = directAgentMessagePayload(
	"mission-visible",
	"control-room-human",
	"website_02_transport",
	"Check the reconnect proof."
);
assert.equal(direct.action, "websiteAgentMissionMessage");
assert.equal(direct.websiteMissionId, "webmission-visible");
assert.equal(direct.toAgent, "website_02_transport");

const ordinary = messagePayload("ordinary-room", "Hello", false, true);
assert.equal(ordinary.action, "missionRoomUserMessage");
assert.equal("websiteMissionId" in ordinary, false);

Registry.forgetWebsiteMission("webmission-visible");
assert.equal(Registry.websiteMissionIdFor("mission-visible"), "");

console.log(JSON.stringify({
	ok: true,
	suite: "website-mission-wake-routing",
	roomWake: true,
	directWake: true,
	ordinaryFallback: true,
	persistentPublicMapping: true
}, null, 2));
