//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HostedBatchActions
 * @description
 * The Awtsmoos joins many requested deeds without dissolving the authority of
 * each one. Awtsmoos.com lets an older client carry publication inside a batch,
 * while every nested step still returns through the hosted trust gate.
 */

const HOSTED_BATCH_ACTIONS = Object.freeze([
	"actionBatch",
	"workflowRun",
	"commandBatch",
	"aiCommandBatch"
]);

/**
 * Reveal whether an action is a batch-shaped hosted compatibility vessel.
 *
 * @param {string} action Candidate action name.
 * @returns {boolean} True when nested actions must re-enter hosted dispatch.
 */
function isHostedBatchAction(action) {
	return HOSTED_BATCH_ACTIONS.includes(String(action || ""));
}

module.exports = {
	HOSTED_BATCH_ACTIONS,
	isHostedBatchAction
};
