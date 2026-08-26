//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Composition root for the hosted Awtsmoos OS action surface.
 * @description
 * The Awtsmoos gathers filesystem, analysis, quality, workflow, runtime, and transport
 * vessels without hiding their distinct laws in one giant repeated map. Awtsmoos.com
 * keeps recursive dispatch narrow and visible, so hundreds of deeds pass one gate in rhyme.
 */
const { actions: documentedActions } = require("../../docs/actions.js");
const { buildAnalysisActions } = require("./analysisActionFamily.js");
const { buildFileMutationActions } = require("./fileMutationActionFamily.js");
const { buildFileReadActions } = require("./fileReadActionFamily.js");
const { buildFileSearchActions } = require("./fileSearchActionFamily.js");
const { buildQualityActions } = require("./qualityActionFamily.js");
const { buildRuntimeActions } = require("./runtimeActionFamily.js");
const { supportAction } = require("./supportActions.js");
const { buildTransportActions } = require("./transportActionFamily.js");
const {
	isVirtualWebsiteMissionAction,
	rejectVirtualWebsiteMission
} = require("./virtualAiAgents.js");
const { buildWorkflowActions } = require("./workflowActionFamily.js");

/**
 * Dispatches one hosted OS action through explicit action families and stable fallbacks.
 *
 * @param {object} $i Authenticated Awtsmoos request context.
 * @param {string} userId Authenticated user identity.
 * @param {object} [payload={}] Public action payload.
 * @returns {Promise<object>} JSON-ready action result.
 */
async function dispatchOsFs($i, userId, payload = {}) {
	const action = payload.action || "list";
	if (isVirtualWebsiteMissionAction(action)) {
		return rejectVirtualWebsiteMission(action, payload);
	}
	const dispatch = next => dispatchOsFs($i, userId, next);
	const actions = buildActionSurface($i, userId, payload, dispatch);
	const handler = actions[action];
	if (handler) {
		return await handler();
	}
	if (documentedActions.includes(action)) {
		return supportAction(action, payload, dispatch);
	}
	return unsupportedAction(action, actions);
}

/**
 * Composes independent action families while preserving one public dispatcher contract.
 *
 * @param {object} $i Authenticated Awtsmoos request context.
 * @param {string} userId Authenticated user identity.
 * @param {object} payload Public action payload.
 * @param {Function} dispatch Recursive dispatcher.
 * @returns {object} Action-name to handler map.
 */
function buildActionSurface($i, userId, payload, dispatch) {
	return {
		...buildFileReadActions($i, userId, payload),
		...buildFileMutationActions($i, userId, payload),
		...buildFileSearchActions($i, userId, payload),
		...buildAnalysisActions($i, userId, payload),
		...buildQualityActions($i, userId, payload, dispatch),
		...buildWorkflowActions(payload, dispatch),
		...buildRuntimeActions(payload),
		...buildTransportActions(payload)
	};
}

function unsupportedAction(action, actions) {
	return {
		ok: false,
		status: 400,
		error: "unsupported_awtsmoos_os_action",
		action,
		availableActions: Object.keys(actions)
	};
}

module.exports = {
	dispatchOsFs
};
