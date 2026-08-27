// B"H

const assert = require("node:assert/strict");
const { buildFsPayload } = require("../tunnelPayload.js");

const expected = {
	websiteMissionId: "web-parent",
	parentWebsiteMissionId: "web-parent",
	parentMissionId: "room-parent",
	parentAgentId: "agent-parent",
	requestKey: "child.transport",
	spawnRequestKey: "child.transport",
	role: "transport specialist",
	scope: "geelooy/api",
	childPrompt: "Verify the bounded transport.",
	kind: "completion",
	evidence: "Focused transport proof passed.",
	reportId: "report-transport-1",
	next: "none",
	findings: "Named carriers survived.",
	references: ["proof.json", "test.cjs"],
	files: ["build.js"],
	toAgent: "all",
	body: "Verified completion.",
	message: "Verified completion.",
	prompt: "Verify the bounded transport.",
	goal: "Keep one same-room child.",
	complete: true,
	refreshAuthentication: true
};

const named = build(expected);
const params = build({ params: JSON.stringify(expected) });
const params64 = build({
	params64: Buffer.from(JSON.stringify(expected)).toString("base64")
});
const keys = Object.keys(expected);

assert.deepEqual(select(named, keys), expected);
assert.deepEqual(select(params, keys), expected);
assert.deepEqual(select(params64, keys), expected);
assert.deepEqual(select(named, keys), select(params, keys));
assert.deepEqual(select(params, keys), select(params64, keys));

console.log(JSON.stringify({
	ok: true,
	suite: "tunnel-payload-website-agent-fields",
	namedParamsEquivalent: true,
	legacyParamsCompatible: true,
	legacyParams64Compatible: true
}, null, 2));

function build(fields) {
	return buildFsPayload({
		paramKinds: { GET: { action: "aiAgentSpawnWebsiteMission", ...fields } }
	});
}

function select(value, keys) {
	return Object.fromEntries(keys.map(key => [key, value[key]]));
}
