//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");

const Service = require("../lib/instructions/service.js").instructionService;

/**
 * @file Proves giant Custom GPT knowledge can become lazy Tunnel instruction chapters.
 * @description
 * Resolution returns IDs and summaries only. Full bodies arrive only after instructionGet,
 * preserving deep doctrine without bloating every Shliach conversation at connection time.
 */
test("mission bootstrap resolves as headlines before full-body retrieval", () => {
	const resolved = Service.resolve({
		task: "Connect to the Awtsmoos Tunnel and request next assignment; then continue what remains.",
		tags: ["mission", "continuation"],
		paths: ["/tmp/project"]
	});
	assert.equal(resolved.ok, true);
	assert.equal(resolved.requiredInstructionIds.includes("mission.bootstrap"), true);
	assert.equal(resolved.requiredInstructionIds.includes("mission.continuation"), true);
	assert.equal("instructions" in resolved, false);
	assert.equal(resolved.instructionSummaries.every(item => !item.instructions), true);
	const details = Service.get({
		instructionIds: ["mission.bootstrap", "mission.continuation"]
	});
	assert.equal(details.ok, true);
	assert.equal(details.instructions.length, 2);
	assert.equal(details.instructions.every(item => item.instructions.length >= 4), true);
});

test("discovery families resolve only their relevant deep doctrine", () => {
	const debt = Service.resolve({
		task: "Inspect technical debt, performance debt, research, and future evolution.",
		tags: ["technical-debt", "research-future"]
	});
	assert.equal(debt.requiredInstructionIds.includes("mission.technical-research"), true);
	const completion = Service.resolve({
		task: "Run the completion challenge and release gate.",
		tags: ["completion-challenge"]
	});
	assert.equal(completion.requiredInstructionIds.includes("mission.completion-gate"), true);
	assert.equal(completion.requiredInstructionIds.includes("mission.project-revelation"), false);
});
