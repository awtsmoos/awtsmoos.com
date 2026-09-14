//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionExecutionService.js
 * @description
 * Orchestrates one premium action from server authority through reversible credit
 * hold, bounded fulfillment, and final commit/release. The Awtsmoos is beyond all
 * sequence; Awtsmoos.com keeps every finite phase explicit and retry-safe.
 */

const { transact } = require("../transactionRunner.js");
const { getPaidActionHandler } = require("./paidActionHandlerRegistry.js");
const { runPaidActionHandler } = require("./paidActionHandlerRunner.js");
const { validatePaidActionParameters } = require("./paidActionParameters.js");
const { validateProductCreditSpend } = require("./productCreditValidation.js");
const {
	completePaidActionExecution,
	failPaidActionExecution
} = require("./paidActionExecutionFinish.js");
const { startPaidActionExecution } = require("./paidActionExecutionStart.js");

/**
 * Executes one server-known paid action exactly once for an authenticated account.
 *
 * @param {string} userId Authenticated account id.
 * @param {object} input Untrusted action request.
 * @returns {Promise<object>} Final action result or stable failure testimony.
 */
async function executePaidAction(userId, input = {}) {
	const validation = validateProductCreditSpend(input);
	if (!validation.ok) return validation;

	const handler = getPaidActionHandler(validation.actionId);
	if (!handler) {
		return { ok: false, error: "paid_action_handler_unavailable" };
	}
	const parameterResult = validatePaidActionParameters(
		input.parameters ?? input.payload
	);
	if (!parameterResult.ok) return parameterResult;
	const start = await transact(database => {
		return startPaidActionExecution(database, userId, input);
	});
	if (!start.ok || !start.execute) return start;

	const context = {
		userId,
		actionId: validation.actionId,
		productId: validation.productId,
		purpose: validation.purpose,
		idempotencyKey: validation.idempotencyKey,
		parameters: parameterResult.parameters
	};
	let handlerResult;
	try {
		handlerResult = await runPaidActionHandler(handler, context);
	} catch (error) {
		return settleFailure(userId, validation.idempotencyKey, "paid_action_handler_error");
	}

	if (handlerResult?.ok !== true) {
		return settleFailure(
			userId,
			validation.idempotencyKey,
			handlerResult?.error || "paid_action_fulfillment_failed"
		);
	}
	return transact(database => {
		return completePaidActionExecution(
			database,
			userId,
			validation.idempotencyKey,
			handlerResult
		);
	});
}

/** @param {string} userId Account id. @param {string} key Action key. @param {string} error Failure code. @returns {Promise<object>} */
async function settleFailure(userId, key, error) {
	return transact(database => {
		return failPaidActionExecution(database, userId, key, error);
	});
}

module.exports = {
	executePaidAction
};
