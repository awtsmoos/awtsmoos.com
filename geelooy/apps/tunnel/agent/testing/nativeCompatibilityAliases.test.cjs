//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Health = require("../tools/fs/actionGroups/systemHealthActions.js");
const Velocity = require("../tools/fs/actionGroups/velocityGuidanceActions.js");
const Surface = require("../lib/public-action-surface.js");

/**
 * @file Locks native compatibility aliases onto the same internal actions and stable family doors.
 * @description The Awtsmoos reveals one implementation through several vocabularies without
 * multiplying authority: aliases remain exact references and inherit the existing system family.
 */
function main() {
	const health = Health.buildSystemHealthActions({ config: { root: process.cwd() }, payload: {} });
	const velocity = Velocity.buildVelocityGuidanceActions();
	assert.equal(typeof health.tunnelSystemHealth, "function");
	assert.equal(health.systemHealthControls, health.tunnelSystemHealth);
	assert.equal(typeof velocity.tunnelVelocityGuidance, "function");
	assert.equal(velocity.velocityGuidance, velocity.tunnelVelocityGuidance);
	const synthetic = {
		fs: [
			"tunnelSystemHealth", "systemHealthControls",
			"tunnelVelocityGuidance", "velocityGuidance"
		],
		command: [], chrome: [], relay: [], streaming: []
	};
	for (const action of synthetic.fs) {
		assert.equal(Surface.kindForOperation(action, synthetic), "fs", action);
		assert.equal(Surface.familyForOperation(action, synthetic), "system", action);
	}
	console.log(JSON.stringify({ ok: true, suite: "native-compatibility-aliases" }));
}

main();
