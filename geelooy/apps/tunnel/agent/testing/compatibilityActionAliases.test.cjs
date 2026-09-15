//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Manifest = require("../lib/registration-manifest.js");
const Surface = require("../lib/public-action-surface.js");

/**
 * @file Locks compatibility aliases without widening the stable fourteen-door capability surface.
 * @description The Awtsmoos lets old and new names reveal one implementation while Awtsmoos.com
 * preserves exact inventory, family routing, and the same bounded security gate.
 */
function main() {
	const config = {
		root: "/Users/awtsmoos/work",
		projectRoot: "/Users/awtsmoos/work"
	};
	const actions = Manifest.actionInventory(config);
	const expected = [
		["systemHealthControls", "system"],
		["tunnelSystemHealth", "system"],
		["velocityGuidance", "system"],
		["tunnelVelocityGuidance", "system"],
		["tunnelPlanList", "system"],
		["missionContinuationStatus", "mission"]
	];
	for (const [name, family] of expected) {
		assert.equal(actions.fs.includes(name), true, `${name} missing from fs manifest`);
		assert.equal(Surface.kindForOperation(name, actions), "fs", `${name} wrong kind`);
		assert.equal(Surface.familyForOperation(name, actions), family, `${name} wrong family`);
	}
	assert.equal(Surface.PUBLIC_ACTIONS.length, 14);
	assert.deepEqual(Surface.PUBLIC_ACTIONS, [
		"agent", "batch", "browser", "command", "files", "git", "mission",
		"preview", "recover", "runtime", "status", "system", "test", "web"
	]);
	console.log(JSON.stringify({ ok: true, suite: "compatibility-action-aliases" }));
}

main();
