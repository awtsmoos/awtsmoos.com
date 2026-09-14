//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file radiancePaidActionSettlement.test.js
 * @description
 * Attacks permanent Radiance settlement under retries and competing fresh keys.
 * The Awtsmoos is beyond debit and possession; Awtsmoos.com proves one finite
 * garment can consume product credits exactly once and remain durably account-bound.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const {
	completePaidActionExecution
} = require("../core/commerce/paidActionExecutionFinish.js");
const {
	startPaidActionExecution
} = require("../core/commerce/paidActionExecutionStart.js");
const { ensureProductCredit } = require("../core/commerce/productCredits.js");

const PRODUCT_ID = "transcribe";
const ACTION_ID = `${PRODUCT_ID}.radiance.unlock`;

/** @returns {object} Fresh Wallet state with enough credits for race attacks. */
function createDatabase() {
	const database = {};
	ensureProductCredit(database, "radiance-user", PRODUCT_ID, 1000).balance = 100;
	return database;
}

/** @param {string} netzachKey Stable action key. @returns {object} Browser-like untrusted input. */
function actionInput(netzachKey) {
	return {
		actionId: ACTION_ID,
		idempotencyKey: netzachKey,
		amount: 1,
		productId: "attacker-product"
	};
}

/** @returns {object} Bounded deterministic handler success. */
function handlerSuccess() {
	return {
		ok: true,
		result: {
			resultRef: `radiance:${PRODUCT_ID}:v1`,
			message: "Radiance unlocked"
		}
	};
}

test("one success consumes 25 credits and grants one permanent entitlement", () => {
	const database = createDatabase();
	const start = startPaidActionExecution(
		database,
		"radiance-user",
		actionInput("radiance-a"),
		2000
	);
	assert.equal(start.execute, true);
	const finish = completePaidActionExecution(
		database,
		"radiance-user",
		"radiance-a",
		handlerSuccess(),
		3000
	);
	const credit = ensureProductCredit(database, "radiance-user", PRODUCT_ID);
	assert.equal(finish.ok, true);
	assert.equal(credit.balance, 75);
	assert.equal(credit.lifetimeConsumed, 25);
	assert.equal(database.entitlements["radiance-user"].length, 1);
});

test("fresh key after ownership exits before another reservation", () => {
	const database = createDatabase();
	startPaidActionExecution(database, "radiance-user", actionInput("radiance-b1"), 2000);
	completePaidActionExecution(database, "radiance-user", "radiance-b1", handlerSuccess(), 3000);
	const repeat = startPaidActionExecution(
		database,
		"radiance-user",
		actionInput("radiance-b2"),
		4000
	);
	assert.equal(repeat.ok, true);
	assert.equal(repeat.alreadyOwned, true);
	assert.equal(repeat.execute, false);
	assert.equal(ensureProductCredit(database, "radiance-user", PRODUCT_ID).balance, 75);
});

test("two fresh keys settle to one charge and one entitlement", () => {
	const database = createDatabase();
	startPaidActionExecution(database, "radiance-user", actionInput("radiance-c1"), 2000);
	startPaidActionExecution(database, "radiance-user", actionInput("radiance-c2"), 2100);
	assert.equal(ensureProductCredit(database, "radiance-user", PRODUCT_ID).balance, 50);
	completePaidActionExecution(database, "radiance-user", "radiance-c1", handlerSuccess(), 3000);
	const second = completePaidActionExecution(
		database,
		"radiance-user",
		"radiance-c2",
		handlerSuccess(),
		3100
	);
	const credit = ensureProductCredit(database, "radiance-user", PRODUCT_ID);
	assert.equal(second.alreadyOwned, true);
	assert.equal(credit.balance, 75);
	assert.equal(credit.lifetimeConsumed, 25);
	assert.equal(database.entitlements["radiance-user"].length, 1);
});
