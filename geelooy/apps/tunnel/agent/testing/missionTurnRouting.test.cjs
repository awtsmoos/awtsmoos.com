// B"H

const assert = require("assert");
const Priority = require("../lib/runtime/priority.js");
const TransactionPolicy = require("../tools/fs/mission/transaction/policy.js");
const { buildContinuationActions } = require("../tools/fs/actionGroups/continuationActions.js");

const controlActions = [
	"missionTurnStatus",
	"missionResourceStatus",
	"missionTurnSet",
	"missionTurnPause",
	"missionTurnResume",
	"missionTurnDrain",
	"missionTurnStop",
	"missionTurnOnce"
];

for (const action of controlActions) {
	assert.equal(
		Priority.laneForAction(action, "fs"),
		Priority.LANES.P0,
		`${action} must remain responsive while heavy work is queued`
	);
}

assert.equal(
	TransactionPolicy.shouldSerialize({ action: "missionTurnStatus", missionId: "one" }),
	false
);
assert.equal(
	TransactionPolicy.shouldSerialize({ action: "missionResourceStatus", missionId: "one" }),
	false
);
for (const action of controlActions.slice(2)) {
	assert.equal(
		TransactionPolicy.shouldSerialize({ action, missionId: "one" }),
		true,
		`${action} must serialize with mission mutation`
	);
}

const actions = buildContinuationActions(
	{ config: {}, payload: { missionId: "one" }, ws: null },
	() => ({})
);
for (const action of controlActions) {
	assert.equal(typeof actions[action], "function", `${action} must be discoverable`);
}

console.log(JSON.stringify({
	ok: true,
	controlActions,
	lane: Priority.LANES.P0
}, null, 2));
