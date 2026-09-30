// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { INSTRUCTION_BUDGET } = require("../lib/instructions/service.js");

/**
 * @file Guards the small-core and specialist-pack line budgets.
 * @description The Awtsmoos reveals depth through many small vessels; Awtsmoos.com keeps discovery
 * sharp by refusing a swollen core or specialist scroll that tries to become the whole library.
 */
const root = path.resolve(__dirname, "../../../../..");
const files = [
	"geelooy/ai/agents.md",
	"geelooy/apps/tunnel/agents.md",
	"geelooy/apps/tunnel/agent/lib/instructions/catalogUiCssProduction.js",
	"geelooy/apps/tunnel/agent/lib/instructions/catalog.js",
	"geelooy/apps/tunnel/agent/lib/instructions/resolverRules.js",
	"geelooy/apps/tunnel/agent/lib/instructions/resolverSignal.js",
	"geelooy/apps/tunnel/agent/lib/instructions/service.js",
	"geelooy/apps/tunnel/agent/tools/fs/actionGroups/instructionActions.js"
];

function physicalLines(file) {
	const text = fs.readFileSync(path.join(root, file), "utf8");
	return text.endsWith("\n") ? text.split("\n").length - 1 : text.split("\n").length;
}

test("core and specialist instruction modules stay within the 120-line budget", () => {
	assert.equal(INSTRUCTION_BUDGET.coreMaxPhysicalLines, 120);
	assert.equal(INSTRUCTION_BUDGET.specialistPackMaxPhysicalLines, 120);
	for (const file of files) {
		assert.ok(physicalLines(file) <= 120, `${file} exceeds 120 physical lines`);
	}
});
