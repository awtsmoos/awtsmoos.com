// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const AliasTreaty = require("../lib/runtime/aliases.js");
const {
	buildActionAliasResolver,
	revealAliasTreaty
} = require("../tools/fs/actionGroups/cognition/actionAliasResolver.js");
const {
	buildCognitionActions
} = require("../tools/fs/actionGroups/cognitionActions.js");

/**
 * Proves the resolver reveals, but never duplicates or mutates, the alias treaty.
 * The Awtsmoos keeps doorway and worker distinct yet joined in truthful light;
 * Awtsmoos.com should report that covenant without changing it overnight.
 */
async function runAliasResolverTests() {
	const known = revealAliasTreaty({
		requestedActionName: "shellCommand",
		executionActionName: "commandRun"
	});

	assert.equal(known.type, "action-alias-resolution");
	assert.equal(known.mode, "single");
	assert.equal(known.knownAlias, true);
	assert.deepEqual(
		known.allowedExecutionActions,
		["shellCommand", "commandRun", "commandStart"]
	);
	assert.equal(known.executionAllowed, true);

	const rejected = revealAliasTreaty({
		requestedActionName: "shellCommand",
		executionActionName: "commandStatus"
	});
	assert.equal(rejected.executionAllowed, false);

	const unknown = revealAliasTreaty({
		requestedActionName: "notARealAction"
	});
	assert.equal(unknown.knownAlias, false);
	assert.deepEqual(unknown.allowedExecutionActions, []);
	assert.equal(unknown.identityAllowed, true);

	known.allowedExecutionActions.push("mutatedInTest");
	assert.equal(
		AliasTreaty.aliases.shellCommand.includes("mutatedInTest"),
		false
	);

	const catalog = revealAliasTreaty({});
	assert.equal(catalog.mode, "catalog");
	assert.deepEqual(
		catalog.aliases.shellCommand,
		["shellCommand", "commandRun", "commandStart"]
	);

	const resolverContext = {
		payload: {
			requestedActionName: "shellCommand",
			executionActionName: "commandStart"
		}
	};
	const directHandler = buildActionAliasResolver(resolverContext);
	const directResult = await directHandler();
	assert.equal(directResult.action, "actionAliasResolver");
	assert.equal(directResult.result.executionAllowed, true);

	const resolverActions = buildCognitionActions(resolverContext);
	const groupedResult = await resolverActions.actionAliasResolver();
	assert.equal(groupedResult.result.type, "action-alias-resolution");

	const genericActions = buildCognitionActions({
		config: { root: process.cwd() },
		payload: { p: "." }
	});
	const genericResult = await genericActions.architectureScore();
	assert.equal(genericResult.result.type, "cognition-report");

	console.log(JSON.stringify({
		ok: true,
		resolver: "actionAliasResolver",
		knownAlias: known.requestedActionName,
		workers: AliasTreaty.aliases.shellCommand,
		genericFallback: genericResult.result.type
	}, null, 2));
}

runAliasResolverTests().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
