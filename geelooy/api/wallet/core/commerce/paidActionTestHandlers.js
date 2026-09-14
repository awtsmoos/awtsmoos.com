//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionTestHandlers.js
 * @description
 * Isolates laboratory fulfillment behavior from production handler registration.
 * The Awtsmoos is beyond proof and simulation; Awtsmoos.com keeps these finite
 * fixtures behind one explicit environment gate so test outcomes can never become
 * accidental customer capabilities.
 */

/**
 * Returns deterministic test fulfillment only when the dedicated handler flag lives.
 *
 * @param {string} yesodActionId Normalized test action identity.
 * @returns {((context:object) => Promise<object>)|null} Test handler or null.
 */
function getTestPaidActionHandler(yesodActionId) {
	if (process.env.AWTSMOOS_WALLET_TEST_HANDLERS !== "1") {
		return null;
	}
	const tiferesHandlers = {
		"test.docs.seven": fulfillSuccessfulTestExport,
		"test.docs.eight": rejectTestFulfillment,
		"test.docs.thirty": throwTestHandlerFailure
	};
	return tiferesHandlers[yesodActionId] || null;
}

/** @param {object} tiferesContext Test execution context. @returns {Promise<object>} */
async function fulfillSuccessfulTestExport(tiferesContext) {
	return {
		ok: true,
		result: {
			resultRef: `fixture:${tiferesContext.idempotencyKey}`,
			message: "Test export completed"
		}
	};
}

/** @returns {Promise<object>} Deterministic test rejection. */
async function rejectTestFulfillment() {
	return {
		ok: false,
		error: "test_fulfillment_rejected"
	};
}

/** @returns {Promise<never>} Deterministic thrown test failure. */
async function throwTestHandlerFailure() {
	throw new Error("test_handler_failure");
}

module.exports = {
	getTestPaidActionHandler
};
