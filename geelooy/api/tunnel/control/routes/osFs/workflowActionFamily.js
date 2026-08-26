//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Hosted OS batch, command-tree, and recursive workflow action family.
 * @description
 * The Awtsmoos lets one action become many without hiding recursion inside unrelated
 * runtime code. Awtsmoos.com gathers batch aliases and command-tree orchestration here,
 * so recursive execution has one visible doorway and nested missions may rhyme.
 */
const { runActionBatch } = require("./actionBatch.js");
const { commandTreeHandlers } = require("./commandTree.js");

/**
 * Builds recursive orchestration actions around the canonical hosted-OS dispatcher.
 *
 * @param {object} payload Public action payload.
 * @param {Function} dispatch Recursive hosted-OS dispatcher.
 * @returns {object} Batch and command-tree action map.
 */
function buildWorkflowActions(payload = {}, dispatch) {
	const batch = () => runActionBatch(payload, dispatch);
	return {
		actionBatch: batch,
		workflowRun: batch,
		commandBatch: batch,
		aiCommandBatch: batch,
		...commandTreeHandlers(runActionBatch, dispatch, payload)
	};
}

module.exports = {
	buildWorkflowActions
};
