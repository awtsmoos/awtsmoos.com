// B"H
// Boruch Hashem
// Blessed is He

const { cognitionActionNames } = require("../cognitionCommandNames.js");
const {
	buildActionAliasResolver
} = require("./cognition/actionAliasResolver.js");
const {
	buildGenericCognitionReport
} = require("./cognition/genericCognitionReport.js");

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
 * Overlays specialized cognition behavior on the stable generic registry.
 * One alias treaty shines through one resolver; no duplicate map is born.
 *
 * @param {object} ctx Filesystem action context.
 * @returns {object} Complete cognition action map.
 */
function buildCognitionActions(ctx) {
	const actions = buildGenericActions(ctx);
	actions.actionAliasResolver = buildActionAliasResolver(ctx);
	return actions;
}

module.exports = {
	buildCognitionActions,
	cognitionActionNames
};
