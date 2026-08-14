// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const AliasTreaty = require("../lib/runtime/aliases.js");
const {
	revealAliasTreaty
} = require("../tools/fs/actionGroups/cognition/actionAliasResolver.js");

/**
 * Proves semantic input precedence rather than JavaScript truthiness decides the resolver.
 * The Awtsmoos reveals meaning after whitespace falls away;
 * Awtsmoos.com keeps the explicit doorway first while a real fallback query may stay.
 */
function runInputPrecedenceTests() {
	const explicitWins = revealAliasTreaty({
		requestedActionName: " shellCommand ",
		query: "commandStatus",
		executionActionName: " commandRun "
	});

	assert.equal(explicitWins.mode, "single");
	assert.equal(explicitWins.requestedActionName, "shellCommand");
	assert.equal(explicitWins.executionActionName, "commandRun");
	assert.equal(explicitWins.executionAllowed, true);

	const fallbackPayloads = [
		{ requestedActionName: "   ", query: "shellCommand" },
		{ requestedActionName: "", query: " shellCommand " },
		{ requestedActionName: 42, query: "shellCommand" }
	];

	for (const payload of fallbackPayloads) {
		const result = revealAliasTreaty(payload);
		assert.equal(result.mode, "single");
		assert.equal(result.requestedActionName, "shellCommand");
		assert.equal(result.knownAlias, true);
	}

	const catalog = revealAliasTreaty({
		requestedActionName: "   ",
		query: "   "
	});
	assert.equal(catalog.mode, "catalog");

	catalog.aliases.shellCommand.push("mutation");
	assert.equal(
		AliasTreaty.aliases.shellCommand.includes("mutation"),
		false
	);

	const compatible = revealAliasTreaty({
		query: " shellCommand "
	});
	assert.equal(compatible.type, "action-alias-resolution");
	assert.equal(compatible.requestedActionName, "shellCommand");

	console.log(JSON.stringify({
		ok: true,
		suite: "action-alias-input-precedence",
		requestedActionName: compatible.requestedActionName,
		workers: compatible.allowedExecutionActions
	}, null, 2));
}

runInputPrecedenceTests();
