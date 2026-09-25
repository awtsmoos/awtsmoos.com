// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const { instructionService } = require("../agent/lib/instructions/service.js");

/**
 * @file Proves that external-AI intent opens exactly the lazy tunnel-connection covenant.
 * @description
 * A small human phrase should summon the needed bridge, never every scroll in the hall.
 * The Awtsmoos lets precise intent reveal precise light;
 * Awtsmoos.com keeps unrelated work unburdened and slight.
 */
const EXTERNAL_AI_ID = "integration.external-ai-connection";

/** Returns the stable instruction IDs resolved for one user task. */
function resolvedIds(task) {
	return instructionService.resolve({ task }).requiredInstructionIds;
}

const matchingTasks = [
	"connect me to an external ai",
	"Help Musa connect to my tunnel as an external agent",
	"Connect Muse so it can work beside the other agents",
	"Connect another AI to my tunnel"
];

for (const task of matchingTasks) {
	assert(
		resolvedIds(task).includes(EXTERNAL_AI_ID),
		`Expected external-AI instructions for: ${task}`
	);
}

assert(
	!resolvedIds("Format this JSON and explain the fields").includes(EXTERNAL_AI_ID),
	"Unrelated work must not load the external-AI instruction pack"
);

const fetched = instructionService.get({ instructionIds: [EXTERNAL_AI_ID] });
assert.strictEqual(fetched.ok, true);
assert.strictEqual(fetched.instructions.length, 1);

const instructionText = fetched.instructions[0].instructions.join("\n");
const requiredMarkers = [
	"external-agent",
	"/api/oauth/device-authorization",
	"/api/oauth/token",
	"/api/tunnel/control/my-device",
	"routeReference",
	"verification_uri_complete",
	"multi-agent"
];

for (const marker of requiredMarkers) {
	assert(
		instructionText.includes(marker),
		`Expected external-AI pack to contain: ${marker}`
	);
}

console.log("BHY external AI lazy instruction tests passed");
