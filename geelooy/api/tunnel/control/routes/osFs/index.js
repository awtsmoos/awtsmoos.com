// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Composition root for the hosted Awtsmoos OS action surface.
 * The Awtsmoos gathers every deed but never disguises an absent light;
 * Awtsmoos.com cannot call a virtual binary transfer right.
 * Supported actions pass through their original authorized families;
 * unsupported byte transfers fail closed until storage can verify them.
 */
const { actions: documentedActions } = require("../../docs/actions.js");
const { buildInstructionActions } = require("./instructionActionFamily.js");
const { buildAnalysisActions } = require("./analysisActionFamily.js");
const { buildFileMutationActions } = require("./fileMutationActionFamily.js");
const { buildFileReadActions } = require("./fileReadActionFamily.js");
const { buildFileSearchActions } = require("./fileSearchActionFamily.js");
const { buildQualityActions } = require("./qualityActionFamily.js");
const { buildRuntimeActions } = require("./runtimeActionFamily.js");
const { supportAction } = require("./supportActions.js");
const { gitClone } = require("./githubCloneAction.js");
const { gitCloneStatus } = require("./githubCloneStatus.js");
const { buildTransportActions } = require("./transportActionFamily.js");
const { guardHostedBinaryAction } = require("./virtualBinaryActionGuard.js");
const {
	isVirtualWebsiteMissionAction,
	rejectVirtualWebsiteMission
} = require("./virtualAiAgents.js");
const { buildWorkflowActions } = require("./workflowActionFamily.js");

/**
 * Routes one hosted action without manufacturing success for missing bytes.
 * @param {object} $i - Authenticated request context.
 * @param {string} userId - Authorized owner of hosted storage.
 * @param {object} [payload={}] - Requested action and its arguments.
 * @returns {Promise<object>} A real action result or an explicit refusal.
 */
async function dispatchOsFs($i, userId, payload = {}) {
	const action = payload.action || "list";
	const binaryRefusal = guardHostedBinaryAction(action);
	if (binaryRefusal) {
		return binaryRefusal;
	}
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
 * Preserves all existing action families and delegated tool contracts.
 * @param {object} $i - Authenticated runtime request context.
 * @param {string} userId - Owner identity.
 * @param {object} payload - Action parameters.
 * @param {Function} dispatch - Recursive authorized dispatcher.
 * @returns {object} Exact handlers for existing hosted capabilities.
 */
function buildActionSurface($i, userId, payload, dispatch) {
	return {
		...buildInstructionActions(userId, payload),
		...buildFileReadActions($i, userId, payload),
		...buildFileMutationActions($i, userId, payload),
		...buildFileSearchActions($i, userId, payload),
		...buildAnalysisActions($i, userId, payload),
		...buildQualityActions($i, userId, payload, dispatch),
		...buildWorkflowActions(payload, dispatch),
		...buildRuntimeActions(payload),
		gitClone: () => gitClone($i, userId, payload, dispatch),
		gitCloneStatus: () => gitCloneStatus($i, userId, payload, dispatch),
		...buildTransportActions(payload, { dispatch })
	};
}

/** Reports unsupported commands without falsely claiming an execution. */
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
