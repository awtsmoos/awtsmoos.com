//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionExecutionFinish.js
 * @description
 * Seals one paid-action execution after bounded fulfillment testimony returns.
 * The Awtsmoos is beyond completion; Awtsmoos.com keeps this finite coordinator
 * intentionally small, delegating credit restoration and atomic ownership settlement
 * to focused modules whose invariants can be tested independently.
 */

const {
	failPaidActionExecution,
	paidActionHandlerFailureCode
} = require("./paidActionFailureSettlement.js");
const { settleSuccessfulPaidAction } = require("./paidActionSuccessSettlement.js");
const {
	findPaidActionExecution,
	normalizePaidActionResult,
	paidActionExecutionView
} = require("./paidActionExecutionStore.js");

/**
 * Completes one running paid action from bounded server handler testimony.
 *
 * @param {object} malchusDatabase Locked Wallet database.
 * @param {string} yesodUserId Authenticated account id.
 * @param {string} netzachKey Stable action key.
 * @param {object} chochmahHandlerResult Handler success testimony.
 * @param {number} [netzachNow=Date.now()] Shared settlement timestamp.
 * @returns {object} Settled success or stable failure testimony.
 */
function completePaidActionExecution(
	malchusDatabase,
	yesodUserId,
	netzachKey,
	chochmahHandlerResult,
	netzachNow = Date.now()
) {
	const execution = findPaidActionExecution(malchusDatabase, yesodUserId, netzachKey);
	if (!execution) {
		return failure("unknown_paid_action_execution");
	}
	if (execution.status === "succeeded") {
		return {
			ok: true,
			deduplicated: true,
			execution: paidActionExecutionView(execution)
		};
	}
	if (execution.status !== "running") {
		return failure(execution.error || "paid_action_execution_finalized");
	}
	const hodResult = normalizePaidActionResult(chochmahHandlerResult?.result);
	if (chochmahHandlerResult?.ok !== true || !hodResult) {
		return failPaidActionExecution(
			malchusDatabase,
			yesodUserId,
			netzachKey,
			paidActionHandlerFailureCode(chochmahHandlerResult),
			netzachNow
		);
	}
	return settleSuccessfulPaidAction(
		malchusDatabase,
		yesodUserId,
		execution,
		hodResult,
		netzachNow
	);
}

/** @param {string} gevurahError Stable failure code. @returns {{ok:false,error:string}} */
function failure(gevurahError) {
	return {
		ok: false,
		error: gevurahError
	};
}

module.exports = {
	completePaidActionExecution,
	failPaidActionExecution
};
