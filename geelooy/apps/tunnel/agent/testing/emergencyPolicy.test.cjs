// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Policy = require("../recovery/emergencyPolicy.js");

/**
 * @file Proves sealed Tier-0 carries recovery authority without command or filesystem authority.
 * @description
 * The Awtsmoos keeps medicine bright while every arbitrary hand sleeps; Awtsmoos.com
 * disables shell, writes, browser, secrets, missions, and recursive agents before the seal keeps.
 */
test("emergency profile is recovery-only and commandless", () => {
	const value = Policy.apply({
		allowSecrets: true,
		allowWrite: true,
		allowCommands: true,
		aiAgents: { agents: [{ id: "unsafe" }], allowRecursiveSpawn: true },
		tools: { chrome: true, browser: true, httpProxy: true, command: true, fsWrite: true },
		command: { enabled: true, allowNodeScript: true }
	});
	assert.equal(value.recoveryOnly, true);
	assert.equal(value.allowSecrets, false);
	assert.equal(value.allowWrite, false);
	assert.equal(value.allowCommands, false);
	assert.equal(value.enableLocalHttpProxy, false);
	assert.deepEqual(value.aiAgents.agents, []);
	assert.equal(value.aiAgents.allowRecursiveSpawn, false);
	assert.equal(value.tools.command, false);
	assert.equal(value.tools.fsRead, false);
	assert.equal(value.tools.fsWrite, false);
	assert.equal(value.tools.chrome, false);
	assert.equal(value.tools.browser, false);
	assert.equal(value.tools.httpProxy, false);
	assert.equal(value.command.enabled, false);
	assert.equal(value.command.allowNodeScript, false);
	assert.equal(value.localApi.enabled, false);
	assert.deepEqual(Policy.environment(), {
		AWTSMOOS_EMERGENCY_MODE: "1",
		AWTSMOOS_MISSION_BOOT_RESUME: "0",
		AWTSMOOS_SELF_UPDATE_DISABLED: "1",
		AWTSMOOS_RECOVERY_ONLY: "1"
	});
});
