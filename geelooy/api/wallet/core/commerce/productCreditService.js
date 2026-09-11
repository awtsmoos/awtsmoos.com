// B"H
// Boruch Hashem
// Blessed is He

const { transact } = require("../transactionRunner.js");
const { consumeProductCredits } = require("./productCredits.js");
const { validateProductCreditSpend } = require("./productCreditValidation.js");

/** Atomically consumes one validated amount of account-bound product credits. */
async function spendProductCredits(userId, input = {}) {
	const validation = validateProductCreditSpend(input);
	if (!validation.ok) return validation;
	return transact(database => consumeProductCredits(
		database,
		userId,
		validation.productId,
		validation.amount,
		validation.idempotencyKey,
		validation.purpose
	));
}

module.exports = {
	spendProductCredits
};
