//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Final = require("../tools/fs/mission/finalInterceptor/index.js");

/**
 * @file Proves a session Mission can never hijack an explicitly targeted Mission action.
 * @description The Awtsmoos lets each Mission answer in its own name, even while another Mission
 * remains advisory in the surrounding session.
 */
test("room action keeps explicit Mission and discards unrelated session advisory", () => {
	const lock = { missionId: "mission_old", releaseAllowed: false };
	const result = Final.intercept(lock, {
		action: "missionRoomCreate",
		missionId: "mission_new",
		roomId: "room_new",
		roomStatus: { missionId: "mission_new", roomId: "room_new", agents: [] },
		next: { action: "missionAnswer", missionId: "mission_old" }
	}, { action: "missionRoomCreate", missionId: "mission_new" });

	assert.equal(result.missionId, "mission_new");
	assert.equal(result.roomId, "room_new");
	assert.equal(result.missionAdvisory, null);
	assert.equal(result.multipleChoiceSelfInterrogation, null);
	assert.equal(result.mustCallNext, undefined);
	assert.equal(result.nextSuggestedToolCall.action, "missionRoomStatus");
	assert.equal(result.nextSuggestedToolCall.missionId, "mission_new");
});

test("newly created Mission outranks an unrelated active session Mission", () => {
	const result = Final.intercept({ missionId: "mission_old" }, {
		action: "missionStart",
		mission: { id: "mission_created" },
		next: { action: "missionNext", missionId: "mission_created" }
	}, { action: "missionStart" });

	assert.equal(result.mission.id, "mission_created");
	assert.equal(result.missionAdvisory, null);
	assert.equal(result.next.missionId, "mission_created");
});

test("ordinary same-Mission work keeps existing advisory continuity", () => {
	const result = Final.intercept({ missionId: "mission_same", releaseAllowed: false }, {
		action: "missionReport"
	}, { action: "missionReport" });
	assert.equal(result.missionAdvisory.missionId, "mission_same");
	assert.equal(result.missionAdvisory.resumeAvailable, true);
});
