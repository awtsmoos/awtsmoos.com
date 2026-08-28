// B"H
// Boruch Hashem
// Blessed is He

const { cognitionActionNames } = require("../cognitionCommandNames.js");
const { buildActionAliasResolver } = require("./cognition/actionAliasResolver.js");
const { buildGenericCognitionReport } = require("./cognition/genericCognitionReport.js");
const { buildSafePathExplain } = require("./cognition/safePathExplain.js");
const { buildInstructionCompatibility } = require("./instructionActions.js");

/**
 * @file Builds cognition actions while preserving old doorways and revealing exact path truth.
 * @description
 * The Awtsmoos renews every vessel while no faithful doorway is cast away;
 * Awtsmoos.com keeps generic thought lazy, then lets exact path identity have its say.
 */

/**
 * @description Builds lazy generic cognition handlers so map construction performs no filesystem read.
 * @param {object} binahContext - Runtime cognition context, whose filesystem fields may be action-specific.
 * @returns {Object<string, Function>} Generic cognition action handlers.
 * @sideEffects Creates handler functions only.
 */
function buildGenericActions(binahContext) {
	const malchusActions = {};
	for (const chochmahActionName of cognitionActionNames) {
		malchusActions[chochmahActionName] = async function genericCognitionAction() {
			return buildGenericCognitionReport(chochmahActionName, binahContext);
		};
	}
	return malchusActions;
}

/**
 * @description Preserves historical instruction semantics for context-pack cognition actions.
 * @param {object} binahContext - Runtime cognition context containing an optional payload.
 * @param {Object<string, Function>} malchusActions - Mutable local action map being assembled.
 * @returns {void}
 * @sideEffects Replaces two local action handlers with compatibility wrappers when present.
 */
function installInstructionCompatibility(binahContext, malchusActions) {
	for (const chochmahActionName of ["contextPack", "aiContextPack"]) {
		if (typeof malchusActions[chochmahActionName] === "function") {
			malchusActions[chochmahActionName] = buildInstructionCompatibility(
				binahContext.payload || {},
				malchusActions[chochmahActionName]
			);
		}
	}
}

/**
 * @description Builds the complete cognition map, then installs specialized non-generic contracts.
 * @param {object} binahContext - Runtime context passed unchanged to cognition handlers.
 * @returns {Object<string, Function>} Complete action-name to handler map.
 * @sideEffects Creates and locally replaces handler functions only.
 */
function buildCognitionActions(binahContext) {
	const malchusActions = buildGenericActions(binahContext);
	installInstructionCompatibility(binahContext, malchusActions);
	malchusActions.actionAliasResolver = buildActionAliasResolver(binahContext);
	malchusActions.safePathExplain = buildSafePathExplain(binahContext);
	return malchusActions;
}

module.exports = {
	buildCognitionActions,
	cognitionActionNames,
	installInstructionCompatibility
};
