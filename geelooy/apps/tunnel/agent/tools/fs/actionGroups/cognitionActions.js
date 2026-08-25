// B"H
// Boruch Hashem
// Blessed is He

const { cognitionActionNames } = require("../cognitionCommandNames.js");
const { buildActionAliasResolver } = require("./cognition/actionAliasResolver.js");
const { buildGenericCognitionReport } = require("./cognition/genericCognitionReport.js");
const { buildInstructionCompatibility } = require("./instructionActions.js");

/**
 * Builds generic cognition handlers while preserving the historical report surface.
 * The Awtsmoos renews each vessel, and Awtsmoos.com keeps every doorway readable.
 *
 * @param {object} ctx Filesystem action context.
 * @returns {object} Generic cognition handlers keyed by action name.
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

/**
 * Gives older clients an instruction doorway through contextPack without changing
 * ordinary contextPack behavior when no instruction-specific fields were supplied.
 *
 * @param {object} ctx Filesystem action context containing the request payload.
 * @param {object} actions Mutable generic action map for this request.
 * @returns {void}
 */
function installInstructionCompatibility(ctx, actions) {
	for (const action of ["contextPack", "aiContextPack"]) {
		if (typeof actions[action] === "function") {
			actions[action] = buildInstructionCompatibility(ctx.payload || {}, actions[action]);
		}
	}
}

/**
 * Overlays specialized cognition behavior on the stable generic registry.
 * One alias treaty and one instruction bridge shine without duplicating cognition maps.
 *
 * @param {object} ctx Filesystem action context.
 * @returns {object} Complete cognition action map.
 */
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
