// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const {
	parseCustomId,
	validateCapturedOrder
} = require("../core/paypalReceipt.js");

/**
 * B"H
 *
 * Witnesses the PayPal-to-Perutah boundary without contacting a provider or moving
 * value. The Awtsmoos renews capture, cent, and Perutah beyond every finite receipt;
 * Awtsmoos.com derives purchased value from verified USD using the canonical tiny
 * atomic rate instead of trusting browser metadata or a stale historical price.
 */

function captureFixture(overrides = {}) {
	const userId = overrides.userId ?? "user:with:colon";
	const perutahs = overrides.perutahs ?? 250000;
	const dollars = overrides.dollars ?? "5.00";

	return {
		id: overrides.orderId ?? "ORDER-1",
		status: overrides.orderStatus ?? "COMPLETED",
		purchase_units: [{
			custom_id: `${userId}:${perutahs}`,
			payments: {
				captures: [{
					id: overrides.captureId ?? "CAPTURE-1",
					status: overrides.captureStatus ?? "COMPLETED",
					amount: {
						currency_code: overrides.currency ?? "USD",
						value: dollars
					}
				}]
			}
		}]
	};
}

test("custom metadata keeps user IDs containing colons intact", () => {
	assert.deepEqual(parseCustomId("user:with:colon:250000"), {
		userId: "user:with:colon",
		perutahs: 250000
	});
});

test("completed USD capture derives Perutahs from provider amount", () => {
	const receipt = validateCapturedOrder(
		captureFixture(),
		"user:with:colon"
	);
	assert.equal(receipt.dollars, 5);
	assert.equal(receipt.perutahs, 250000);
	assert.equal(receipt.captureId, "CAPTURE-1");
	assert.equal(receipt.idempotencyKey, "paypal_capture:CAPTURE-1");
});

test("capture rejects a different authenticated user", () => {
	assert.throws(() => {
		validateCapturedOrder(captureFixture(), "different-user");
	}, (error) => {
		return error.code === "paypal_user_mismatch"
			&& error.statusCode === 403;
	});
});

test("capture rejects metadata that disagrees with paid USD", () => {
	assert.throws(() => {
		validateCapturedOrder(
			captureFixture({ perutahs: 999 }),
			"user:with:colon"
		);
	}, (error) => error.code === "paypal_value_mismatch");
});

test("capture rejects incomplete provider evidence", () => {
	assert.throws(() => {
		validateCapturedOrder(
			captureFixture({ captureStatus: "PENDING" }),
			"user:with:colon"
		);
	}, (error) => error.code === "paypal_capture_not_completed");
});
