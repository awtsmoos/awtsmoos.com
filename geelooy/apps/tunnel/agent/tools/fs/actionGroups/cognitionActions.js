// B"H
// Boruch Hashem
// Blessed is He

const { cognitionActionNames } = require("../cognitionCommandNames.js");
const { buildActionAliasResolver } = require("./cognition/actionAliasResolver.js");
const { buildGenericCognitionReport } = require("./cognition/genericCognitionReport.js");
const { buildInstructionCompatibility } = require("./instructionActions.js");

/**
 * @file Builds cognition actions while preserving an instruction doorway for older clients.
 * @description
 * The Awtsmoos keeps old vessels useful while new names emerge. Awtsmoos.com therefore
 * lets contextPack resolve/fetch doctrine only when explicit instruction fields or prefixes exist.
 */
function buildGenericActions(ctx) {
	const actions = {};
	for (const action of cognitionActionNames) {
		actions[action] = async function genericCognitionAction() {
			return buildGenericCognitionReport(action, ctx);
		};
	}
	return actions;
}

/** Wraps historical contextPack actions without changing ordinary cognition requests. */
function installInstructionCompatibility(ctx, actions) {
	for (const action of ["contextPack", "aiContextPack"]) {
		if (typeof actions[action] === "function") {
			actions[action] = buildInstructionCompatibility(
				ctx.payload || {},
				actions[action]
			);
		}
	}
}

/** Builds the complete cognition map with specialized aliases and instruction compatibility. */
function buildCognitionActions(ctx) {
	const actions = buildGenericActions(ctx);
	installInstructionCompatibility(ctx, actions);
	actions.actionAliasResolver = buildActionAliasResolver(ctx);
	return actions;
}

module.exports = {
	buildCognitionActions,
	cognitionActionNames,
	installInstructionCompatibility
};
