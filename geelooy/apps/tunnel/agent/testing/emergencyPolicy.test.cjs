// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Policy = require("../recovery/emergencyPolicy.js");

test("emergency profile preserves one authenticated repair worker only", () => {
	const value = Policy.apply({
		allowSecrets: true,
		aiAgents: { agents: [{ id: "unsafe" }], allowRecursiveSpawn: true },
		tools: { chrome: true, browser: true, httpProxy: true, command: true },
		command: { enabled: true, allowNodeScript: true, timeoutMs: 999999 }
	}, { port: 3987 });
	assert.equal(value.allowSecrets, false);
	assert.equal(value.allowCommands, true);
	assert.equal(value.enableLocalHttpProxy, false);
	assert.deepEqual(value.aiAgents.agents, []);
	assert.equal(value.aiAgents.allowRecursiveSpawn, false);
	assert.equal(value.tools.command, true);
	assert.equal(value.tools.fsRead, true);
	assert.equal(value.tools.fsWrite, true);
	assert.equal(value.tools.chrome, false);
	assert.equal(value.tools.browser, false);
	assert.equal(value.tools.httpProxy, false);
	assert.equal(value.command.allowNodeScript, false);
	assert.equal(value.localApi.port, 3987);
	assert.deepEqual(Policy.environment(), {
		AWTSMOOS_COMMAND_TIER: "0",
		AWTSMOOS_COMMAND_MAX_ACTIVE: "1",
		AWTSMOOS_EMERGENCY_MODE: "1",
		AWTSMOOS_MISSION_BOOT_RESUME: "0",
		AWTSMOOS_DISABLE_SELF_UPDATE: "1"
	});
});
