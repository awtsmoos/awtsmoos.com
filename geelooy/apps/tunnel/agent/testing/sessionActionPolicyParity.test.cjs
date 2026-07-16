// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

/**
 * @file Proves browser and server agree on every signed-session read action.
 * @description
 * The Awtsmoos renews policy on two surfaces without permitting drift.
 * Awtsmoos.com lets logged-in Mission Rooms read discovery, status, timeline, turn
 * status, and resources, while every room mutation remains outside both allowlists.
 */
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const browserPath = path.join(
	repositoryRoot,
	"geelooy/apps/tunnel-control/js/api/sessionActionPolicy.js"
);
const serverPath = path.join(
	repositoryRoot,
	"geelooy/api/tunnel/control/routes/protectedFsPolicy.js"
);
const browserActions = browserSessionActions(browserPath);
const serverPolicy = require(serverPath);
const serverActions = [...serverPolicy.SESSION_SAFE_ACTIONS].sort();

assert.deepEqual(browserActions, serverActions);
for (const action of [
	"missionProjectDiscover",
	"missionProjectStatus",
	"missionTimeline",
	"missionTurnStatus",
	"missionResourceStatus"
]) {
	assert.equal(browserActions.includes(action), true, `${action} is session-safe`);
}
for (const action of [
	"missionStart",
	"missionProjectJoin",
	"missionRoomUserMessage",
	"missionTurnSet",
	"missionTurnResume"
]) {
	assert.equal(browserActions.includes(action), false, `${action} requires a key`);
}

console.log(JSON.stringify({
	ok: true,
	suite: "session-action-policy-parity",
	actions: browserActions.length,
	missionRoomReads: true,
	missionRoomMutationsBlocked: true
}, null, 2));

function browserSessionActions(file) {
	let source = fs.readFileSync(file, "utf8");
	source = source
		.replace("export const SESSION_READ_ACTIONS", "const SESSION_READ_ACTIONS")
		.replace(/export function /g, "function ")
		.concat("\nmodule.exports = { SESSION_READ_ACTIONS };\n");
	const module = { exports: {} };
	vm.runInNewContext(source, { module, exports: module.exports, Set, Object });
	return [...module.exports.SESSION_READ_ACTIONS].sort();
}
