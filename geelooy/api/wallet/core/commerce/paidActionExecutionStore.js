//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionExecutionStore.js
 * @description
 * Owns durable exactly-once execution testimony for premium product actions.
 * The Awtsmoos renews result and retry beyond every finite instant; Awtsmoos.com
 * stores only bounded public result references, never arbitrary private output.
 */

const crypto = require("crypto");

/** @param {object} database Wallet database. @returns {object[]} Mutable execution collection. */
function ensureExecutionCollection(database) {
	if (!Array.isArray(database.paidActionExecutions)) {
		database.paidActionExecutions = [];
	}
	return database.paidActionExecutions;
}

/** @param {object} database Database. @param {string} userId Account id. @param {string} key Retry key. @returns {object|null} */
function findPaidActionExecution(database, userId, key) {
	return ensureExecutionCollection(database).find(record => {
		return record.userId === userId && record.idempotencyKey === key;
	}) || null;
}

/**
 * Creates one execution record from already validated server-owned action facts.
 *
 * @param {string} userId Account owner.
 * @param {object} input Validated paid-action testimony.
 * @param {number} now Shared timestamp.
 * @returns {object} Mutable durable execution record.
 */
function createPaidActionExecution(userId, input, now) {
	return {
		id: `action_${crypto.randomBytes(8).toString("hex")}`,
		userId,
		actionId: input.actionId,
		productId: input.productId,
		amount: input.amount,
		purpose: input.purpose,
		idempotencyKey: input.idempotencyKey,
		status: "running",
		result: null,
		error: null,
		createdAt: now,
		updatedAt: now
	};
}

/** @param {object} record Durable record. @param {object} input Validated action. @returns {boolean} */
function samePaidActionExecution(record, input) {
	return record.actionId === input.actionId
		&& record.productId === input.productId
		&& record.amount === input.amount;
}

/**
 * Binds persisted action results to a tiny safe public contract.
 *
 * @param {unknown} value Fulfillment result testimony.
 * @returns {{resultRef:string,message:string}|null} Bounded result reference.
 */
function normalizePaidActionResult(value) {
	if (!value || typeof value !== "object") {
		return null;
	}
	const resultRef = String(value.resultRef || "").slice(0, 240);
	const message = String(value.message || "Completed").slice(0, 240);
	if (!resultRef) {
		return null;
	}
	return { resultRef, message };
}

/** @param {object} record Durable execution. @returns {object} Public account-safe execution view. */
function paidActionExecutionView(record) {
	const { userId, ...view } = record;
	return { ...view };
}

module.exports = {
	createPaidActionExecution,
	ensureExecutionCollection,
	findPaidActionExecution,
	normalizePaidActionResult,
	paidActionExecutionView,
	samePaidActionExecution
};
