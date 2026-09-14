// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");

/** @returns {{balance:number,lifetimePurchased:number,updatedAt:number}} */
function emptyCreditState(now = Date.now()) {
	return { balance: 0, lifetimePurchased: 0, lifetimeConsumed: 0, updatedAt: now };
}

/** Ensures one account/product consumable-credit state inside the locked database. */
function ensureProductCredit(database, userId, productId, now = Date.now()) {
	database.productCredits ||= {};
	database.productCredits[userId] ||= {};
	database.productCredits[userId][productId] ||= emptyCreditState(now);
	return database.productCredits[userId][productId];
}

/** Returns a copy of all product credit states owned by one account. */
function listProductCredits(database, userId) {
	const credits = database.productCredits?.[userId] || {};
	return Object.entries(credits).map(([productId, state]) => ({
		productId,
		balance: Math.max(0, Math.floor(Number(state.balance || 0))),
		lifetimePurchased: Math.max(0, Math.floor(Number(state.lifetimePurchased || 0))),
		lifetimeConsumed: Math.max(0, Math.floor(Number(state.lifetimeConsumed || 0))),
		updatedAt: Number(state.updatedAt || 0)
	}));
}

/** Grants one server-authored consumable credit pack and records its own ledger row. */
function grantProductCredits(database, userId, sku, now = Date.now()) {
	const units = Math.max(0, Math.floor(Number(sku.creditUnits || 0)));
	if (!units) throw new Error("invalid_credit_grant");
	const state = ensureProductCredit(database, userId, sku.productId, now);
	state.balance += units;
	state.lifetimePurchased += units;
	state.updatedAt = now;
	const transaction = Object.freeze({
		id: "credit_" + crypto.randomBytes(8).toString("hex"),
		userId,
		productId: sku.productId,
		skuId: sku.id,
		delta: units,
		kind: "purchase_grant",
		at: now
	});
	database.productCreditTxs ||= [];
	database.productCreditTxs.push(transaction);
	return { state: { ...state }, transaction };
}

/** Finds one product-credit transaction by account and stable operation key. */
function findProductCreditSpend(database, userId, idempotencyKey) {
	return (database.productCreditTxs || []).find(transaction => {
		return transaction.userId === userId && transaction.idempotencyKey === idempotencyKey;
	}) || null;
}

/** Consumes account-bound product credits atomically inside an existing lock. */
function consumeProductCredits(database, userId, productId, amount, idempotencyKey, purpose) {
	const prior = findProductCreditSpend(database, userId, idempotencyKey);
	const state = ensureProductCredit(database, userId, productId);
	if (prior && !sameCreditSpend(prior, productId, amount, purpose)) {
		return { ok: false, error: "idempotency_conflict", transaction: prior };
	}
	if (prior) return { ok: true, deduplicated: true, balance: state.balance, transaction: prior };
	if (state.balance < amount) return { ok: false, error: "insufficient_product_credits", balance: state.balance };
	state.balance -= amount;
	state.lifetimeConsumed = Math.max(0, Math.floor(Number(state.lifetimeConsumed || 0))) + amount;
	state.updatedAt = Date.now();
	const transaction = Object.freeze({
		id: "credit_" + crypto.randomBytes(8).toString("hex"),
		userId,
		productId,
		delta: -amount,
		kind: "consume",
		purpose,
		idempotencyKey,
		at: state.updatedAt
	});
	database.productCreditTxs ||= [];
	database.productCreditTxs.push(transaction);
	return { ok: true, deduplicated: false, balance: state.balance, transaction };
}

function sameCreditSpend(transaction, productId, amount, purpose) {
	return transaction.productId === productId
		&& transaction.delta === -amount
		&& transaction.purpose === purpose;
}

module.exports = {
	ensureProductCredit,
	listProductCredits,
	grantProductCredits,
	findProductCreditSpend,
	consumeProductCredits
};
