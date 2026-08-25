// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { instructionKeter } = require("../lib/instructions/catalog.js");
const { instructionService } = require("../lib/instructions/service.js");
const Actions = require("../tools/fs/actionGroups/instructionActions.js");

/**
 * @file Proves summaries stay compact while required tasks resolve to complete doctrine.
 * @description
 * The Awtsmoos lets one sentence point toward a full law without making every response
 * carry the law itself. Awtsmoos.com tests catalog, resolution, retrieval, and old-client bridges.
 */
async function main() {
	const catalog = instructionService.catalog();
	assert.equal(catalog.ok, true);
	assert.equal(catalog.instructions.length, 13);
	assert.equal(new Set(catalog.instructions.map(item => item.id)).size, 13);
	assert.ok(catalog.instructions.every(item => !Object.hasOwn(item, "instructions")));

	const resolved = instructionService.resolve({
		instructionTask: "Improve a mobile responsive UI component, localized CSS, JavaScript API, tests, and deployment"
	});
	for (const id of [
		"work.inspect-before-write",
		"work.whole-file-rewrites",
		"craft.continuous-improvement",
		"ui.futuristic-professional",
		"ui.localized-styles",
		"ui.interaction-states",
		"ui.mobile-first-motion",
		"code.javascript-architecture",
		"code.naming-documentation",
		"api.simple-data-contracts",
		"stability.safe-execution"
	]) {
		assert.ok(resolved.requiredInstructionIds.includes(id), `missing resolved instruction ${id}`);
	}
	assert.equal(resolved.mustFetchBeforeWrite, true);

	const fetched = instructionService.get({ instructionIds: resolved.requiredInstructionIds });
	assert.equal(fetched.ok, true);
	assert.equal(fetched.instructions.length, resolved.requiredInstructionIds.length);
	assert.ok(fetched.instructions.every(item => item.instructions.length >= 4));

	const missing = instructionService.get({ instructionIds: ["ui.localized-styles", "missing.id"] });
	assert.equal(missing.ok, false);
	assert.deepEqual(missing.missingInstructionIds, ["missing.id"]);

	const fallback = async () => ({ fallback: true });
	const legacyGet = await Actions.buildInstructionCompatibility({
		query: "instruction-get: ui.localized-styles"
	}, fallback)();
	assert.equal(legacyGet.instructions[0].id, "ui.localized-styles");
	const legacyResolve = await Actions.buildInstructionCompatibility({
		query: "instruction-resolve: improve responsive css ui"
	}, fallback)();
	assert.ok(legacyResolve.requiredInstructionIds.includes("ui.localized-styles"));
	assert.deepEqual(await Actions.buildInstructionCompatibility({ query: "ordinary context" }, fallback)(), { fallback: true });

	assert.equal(instructionKeter.get("api.simple-data-contracts").version, 1);
	console.log(JSON.stringify({ ok: true, suite: "instruction-system", instructions: 13 }));
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
