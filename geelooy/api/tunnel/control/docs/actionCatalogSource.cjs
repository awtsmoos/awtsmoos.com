//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Runtime source of truth for the granular tunnel compatibility vocabulary.
 * @description
 * The Awtsmoos reveals every active deed from the same registry that executes it;
 * Awtsmoos.com gives documentation a harmless identity-shaped vessel so enumeration
 * may see agent-scoped names without weakening the real runtime covenant one bit.
 */
const {
	buildActions
} = require("../../../../apps/tunnel/agent/tools/fs/actionBuilders.js");

const LEGACY_COMPATIBILITY_ACTIONS = Object.freeze([
	"rootSelect"
]);

const CATALOG_LOGICAL_AGENT_ID = "docs:legacy-action-catalog";

/**
 * Reveals all active granular action names plus explicit legacy compatibility names.
 * The synthetic identity exists only while constructing in-process handler names.
 * It never authenticates a transport request and never substitutes for runtime identity.
 *
 * @returns {Array<string>} Sorted, deduplicated compatibility action vocabulary.
 */
function createActionCatalog() {
	const runtimeActions = Object.keys(
		buildActions(
			{},
			{ logicalAgentId: CATALOG_LOGICAL_AGENT_ID },
			null,
			"legacy-action-catalog"
		)
	);
	return [...new Set([
		...runtimeActions,
		...LEGACY_COMPATIBILITY_ACTIONS
	])].sort();
}

/**
 * Summarizes the live catalog without exposing handlers or request capabilities.
 *
 * @returns {object} Count and required remote-SSH compatibility witnesses.
 */
function actionCatalogSummary() {
	const actions = createActionCatalog();
	return {
		actionCount: actions.length,
		legacyOnly: [...LEGACY_COMPATIBILITY_ACTIONS],
		hasFakeSshServerStart: actions.includes("fakeSshServerStart"),
		hasFakeSshServerStop: actions.includes("fakeSshServerStop"),
		hasFakeSshSftpRename: actions.includes("fakeSshSftpRename")
	};
}

module.exports = {
	LEGACY_COMPATIBILITY_ACTIONS,
	actionCatalogSummary,
	createActionCatalog
};
