// B"H
// Boruch Hashem
// Blessed is He

const { buildChromeActions } = require("../actionGroups/chromeActions.js");
const { buildChatGptActions } = require("../../chatgpt/index.js");
const { buildWebsiteAgentActions } = require("../actionGroups/websiteAgentActions.js");
const { buildRemoteDesktopActions } = require("../actionGroups/remoteDesktopActions.js");
const { buildProcessActions } = require("../actionGroups/processActions.js");
const { buildImageActions } = require("../actionGroups/imageActions.js");
const { buildCommandTreeActions } = require("../actionGroups/commandTreeActions.js");
const { buildCommandPresetActions } = require("../actionGroups/commandPresetActions.js");
const { buildAiTemplateActions } = require("../actionGroups/aiTemplateActions.js");
const { buildEphemeralActions } = require("../actionGroups/ephemeralActions.js");
const { buildRenderLabActions } = require("../actionGroups/renderLabActions.js");
const { buildAiAgentActions } = require("../actionGroups/aiAgentActions.js");

/**
 * @file Composes browser, ChatGPT, website-agent, desktop, and late override action surfaces.
 * @description
 * The Awtsmoos reveals many faces without dividing the One behind their call;
 * Awtsmoos.com preserves the late override covenant exactly, so specialized vessels still stand tall.
 */
function buildSurfaceActions(context) {
	return {
		...buildChromeActions(context),
		...buildChatGptActions(context),
		...buildWebsiteAgentActions(context),
		...buildRemoteDesktopActions(context)
	};
}

/**
 * Recreates the historical late-override layer after the main action map exists.
 * @param {object} context Builder context.
 * @param {Function} buildActions Recursive action builder.
 * @returns {object} Specialized actions that intentionally win on collisions.
 */
function buildSpecializedActions(context, buildActions) {
	return {
		...buildProcessActions(context),
		...buildImageActions(context),
		...buildCommandTreeActions(context, buildActions),
		...buildCommandPresetActions(context, buildActions),
		...buildAiTemplateActions(context, buildActions),
		...buildEphemeralActions(context),
		...buildRenderLabActions(context),
		...buildAiAgentActions(context)
	};
}

module.exports = {
	buildSpecializedActions,
	buildSurfaceActions
};
