// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Manifest = require("../lib/registration-manifest.js");
const Surface = require("../lib/public-action-surface.js");

/**
 * @file Proves fourteen public vessels cover a complete internal action universe.
 * @description
 * The Awtsmoos is One while many deeds remain exact below; Awtsmoos.com gives agents
 * fourteen clear doors, keeps more than nine hundred inner actions, and never trades power for show.
 */
const expected = [
	"agent", "batch", "browser", "command", "files", "git", "mission",
	"preview", "recover", "runtime", "status", "system", "test", "web"
];
const config = {
	root: process.cwd(),
	allowWrite: true,
	allowCommands: true,
	allowSecrets: false
};
const registration = Manifest.build(config);
const internalCount = Manifest.uniqueActions(registration.actions).length;

assert.deepEqual([...Surface.PUBLIC_ACTIONS], expected);
assert.deepEqual(registration.supportedActions, expected);
assert.equal(registration.publicActionCount, 14);
assert.ok(internalCount > 900, `expected >900 internal actions, received ${internalCount}`);
assert.equal(typeof registration.publicActionDigest, "string");
assert.equal(registration.publicActionDigest.length, 64);

const synthetic = {
	fs: [
		"read", "httpRequest", "gitStatusDeep", "missionStart", "aiContextPack",
		"runtimeWorkflow", "testRunner", "previewCreate", "actionBatch", "payloadEcho",
		"agentDoctor", "nativeGenerationReplace"
	],
	command: ["commandRun"],
	chrome: ["chromeClick"],
	relay: [],
	streaming: []
};
const cases = {
	read: "files",
	commandRun: "command",
	chromeClick: "browser",
	httpRequest: "web",
	gitStatusDeep: "git",
	missionStart: "mission",
	aiContextPack: "agent",
	runtimeWorkflow: "runtime",
	testRunner: "test",
	previewCreate: "preview",
	actionBatch: "batch",
	payloadEcho: "system",
	agentDoctor: "status",
	nativeGenerationReplace: "recover"
};
for (const [operation, family] of Object.entries(cases)) {
	assert.equal(Surface.familyForOperation(operation, synthetic), family, operation);
}
for (const publicAction of Surface.PUBLIC_ACTIONS) {
	assert.equal(Surface.familyForOperation(publicAction, synthetic), "", publicAction);
}
console.log(JSON.stringify({ ok: true, publicCount: 14, internalCount }));
