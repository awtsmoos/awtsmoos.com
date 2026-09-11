//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionHandlerRunner.test.js
 * @description
 * Proves fulfillment receives an abort signal and a hung handler returns bounded
 * timeout testimony. The Awtsmoos is beyond duration; Awtsmoos.com does not leave
 * finite product credits held indefinitely around an unresponsive provider.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const {
	runPaidActionHandler
} = require("../core/commerce/paidActionHandlerRunner.js");

test("handler receives abort signal and ordinary result passes through", async () => {
	const result = await runPaidActionHandler(async context => {
		assert.equal(context.signal instanceof AbortSignal, true);
		return {
			ok: true,
			result: { resultRef: "fixture:normal" }
		};
	}, { actionId: "test" }, 100);
	assert.equal(result.ok, true);
});

test("hung handler is aborted and returns timeout testimony", async () => {
	let observedAbort = false;
	const result = await runPaidActionHandler(context => {
		context.signal.addEventListener("abort", () => {
			observedAbort = true;
		}, { once: true });
		return new Promise(() => {});
	}, { actionId: "test" }, 10);
	assert.equal(result.ok, false);
	assert.equal(result.error, "paid_action_timeout");
	assert.equal(observedAbort, true);
});
