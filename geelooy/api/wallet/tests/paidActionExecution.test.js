//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionExecution.test.js
 * @description
 * Proves the preferred paid-action gateway charges only after useful fulfillment,
 * restores failed holds, and replays successful output exactly once. The Awtsmoos
 * is beyond retry; Awtsmoos.com keeps each finite operation economically coherent.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fsp = require("fs/promises");
const os = require("os");
const path = require("path");

const dataDir = path.join(os.tmpdir(), `awtsmoos-action-execution-${process.pid}`);
process.env.AWTSMOOS_WALLET_DATA_DIR = dataDir;
process.env.AWTSMOOS_WALLET_TEST_ACTIONS = "1";
process.env.AWTSMOOS_WALLET_TEST_HANDLERS = "1";

const { executePaidAction } = require("../core/commerce/paidActionExecutionService.js");
const { ensureProductCredit } = require("../core/commerce/productCredits.js");
const { readWalletDb } = require("../core/persistence.js");
const { transact } = require("../core/transactionRunner.js");

test.beforeEach(async () => {
	await fsp.rm(dataDir, { recursive: true, force: true });
});

test.after(async () => {
	await fsp.rm(dataDir, { recursive: true, force: true });
});

test("successful fulfillment commits exact server cost and replays result", async () => {
	await seedDocsCredits("success-user", 20);
	const input = {
		actionId: "test.docs.seven",
		idempotencyKey: "action-success-001",
		amount: 1,
		productId: "attacker-product"
	};
	const first = await executePaidAction("success-user", input);
	const retry = await executePaidAction("success-user", input);
	const credit = await docsCredit("success-user");
	assert.equal(first.ok, true);
	assert.equal(first.execution.result.resultRef, "fixture:action-success-001");
	assert.equal(retry.ok, true);
	assert.equal(retry.deduplicated, true);
	assert.equal(credit.balance, 13);
	assert.equal(credit.lifetimeConsumed, 7);
});

test("handler rejection restores the reserved credits", async () => {
	await seedDocsCredits("reject-user", 20);
	const result = await executePaidAction("reject-user", {
		actionId: "test.docs.eight",
		idempotencyKey: "action-reject-001"
	});
	const credit = await docsCredit("reject-user");
	assert.equal(result.ok, false);
	assert.equal(result.error, "test_fulfillment_rejected");
	assert.equal(credit.balance, 20);
	assert.equal(credit.lifetimeConsumed, 0);
});

test("thrown handler failure releases credits without exposing exception text", async () => {
	await seedDocsCredits("throw-user", 40);
	const result = await executePaidAction("throw-user", {
		actionId: "test.docs.thirty",
		idempotencyKey: "action-throw-001"
	});
	assert.equal(result.error, "paid_action_handler_error");
	assert.equal((await docsCredit("throw-user")).balance, 40);
});

test("malformed and oversized parameters fail before any credit hold", async () => {
	await seedDocsCredits("parameter-user", 20);
	const malformed = await executePaidAction("parameter-user", {
		actionId: "test.docs.seven",
		idempotencyKey: "action-params-001",
		parameters: "not-json"
	});
	const oversized = await executePaidAction("parameter-user", {
		actionId: "test.docs.seven",
		idempotencyKey: "action-params-002",
		parameters: { value: "x".repeat(40 * 1024) }
	});
	assert.equal(malformed.error, "invalid_paid_action_parameters");
	assert.equal(oversized.error, "paid_action_parameters_too_large");
	assert.equal((await docsCredit("parameter-user")).balance, 20);
});

/** @param {string} userId Account id. @param {number} balance Starting credits. @returns {Promise<void>} */
async function seedDocsCredits(userId, balance) {
	await transact(database => {
		const credit = ensureProductCredit(database, userId, "docs");
		credit.balance = balance;
	});
}

/** @param {string} userId Account id. @returns {Promise<object>} Current Docs credit state. */
async function docsCredit(userId) {
	const database = await readWalletDb();
	return database.productCredits[userId].docs;
}
