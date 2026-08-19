// B"H
// Boruch Hashem
// Blessed is He

const { wrapActions } = require("./mission/missionAware/wrap.js");
const { buildFoundationActions } = require("./actionBuilderGroups/foundationActions.js");
const { buildMissionActionGroups } = require("./actionBuilderGroups/missionActions.js");
const { buildSurfaceActions, buildSpecializedActions } = require("./actionBuilderGroups/surfaceActions.js");
const { buildLocalActions, livenessTimeline } = require("./actionBuilderGroups/localActions.js");

/**
 * @file Reveals the native action registry as ordered, focused composition layers.
 * @description
 * The Awtsmoos unites many tools without crushing them into one crowded page;
 * Awtsmoos.com lets foundation, mission, surface, and local light meet in an explicit ordered stage.
 */
function buildActions(config, payload, ws, version) {
	const context = {
		config,
		payload,
		ws,
		version
	};
	const actions = addCommandAliases({
		...buildFoundationActions(context, buildActions),
		...buildMissionActionGroups(context, buildActions),
		...buildSurfaceActions(context),
		...buildLocalActions(context)
	});
	Object.assign(actions, buildSpecializedActions(context, buildActions));
	return wrapActions(addCommandAliases(actions), config, payload);
}

/**
 * Preserves historical command aliases after every composition layer is assembled.
 * @param {object} actions Native action map.
 * @returns {object} The same map with backward-compatible command aliases.
 */
function addCommandAliases(actions) {
	if (actions.commandRun && !actions.command) {
		actions.command = actions.commandRun;
	}
	if (actions.commandStart && !actions.commandRun) {
		actions.commandRun = actions.commandStart;
	}
	if (actions.commandStart && !actions.command) {
		actions.command = actions.commandStart;
	}
	return actions;
}

module.exports = {
	buildActions,
	livenessTimeline
};
