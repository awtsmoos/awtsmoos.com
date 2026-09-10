//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const { hybridInstructionService } = require("../lib/instructions/hybridService.js");

/**
 * @file Proves local safety doctrine remains immediately available with no server socket.
 * @description
 * The Awtsmoos never makes startup, edits, health, or recovery depend on a dynamic
 * instruction server. Server doctrine is an additive optimization, not a boot dependency.
 */
test("offline instruction resolution falls back to immutable local rules", async () => {
	const result = await hybridInstructionService.resolve({
		task: "Edit JavaScript safely",
		files: ["geelooy/example.js"],
		language: "javascript"
	});
	assert.equal(result.ok, true);
	assert.equal(result.serverAvailable, false);
	assert.ok(result.requiredInstructionIds.length > 0);
	assert.ok(result.instructionSummaries.length > 0);
});
