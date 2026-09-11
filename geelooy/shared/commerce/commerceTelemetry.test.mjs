//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file commerceTelemetry.test.mjs
 * @description
 * Proves the local commerce metric boundary rejects unknown event families and strips
 * unapproved detail fields. The Awtsmoos is beyond measure; Awtsmoos.com therefore
 * allows finite conversion testimony only through explicit names and bounded scalars,
 * never through arbitrary product content, account data, prompts, files, or payments.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	commerceMetric
} from "./commerceTelemetry.js";

/**
 * Verifies store-open telemetry carries only the canonical product identity.
 */
test("open metric strips unapproved detail", () => {
	const metric = commerceMetric("open", {
		productId: "transcribe",
		userId: "private-user",
		prompt: "private prompt"
	});
	assert.deepEqual(metric, {
		name: "open",
		productId: "transcribe"
	});
});

/**
 * Verifies successful purchase telemetry keeps only the public SKU identity.
 */
test("purchase metric strips account and payment-shaped fields", () => {
	const metric = commerceMetric("purchase", {
		skuId: "transcribe.credits.100",
		accountId: "secret-account",
		paymentToken: "secret-token"
	});
	assert.deepEqual(metric, {
		name: "purchase",
		skuId: "transcribe.credits.100"
	});
});

/**
 * Verifies top-up intent can report its finite public amount without other details.
 */
test("top-up metric keeps only finite amount", () => {
	assert.deepEqual(
		commerceMetric("topup-start", {
			dollars: 10,
			providerOrder: "private-provider-order"
		}),
		{
			name: "topup-start",
			dollars: 10
		}
	);
});

/**
 * Verifies Radiance success exposes only product/action identities.
 */
test("Radiance metric keeps only capability identity", () => {
	const metric = commerceMetric("radiance-unlocked", {
		productId: "transcribe",
		actionId: "transcribe.radiance.unlock",
		transcript: "private transcript"
	});
	assert.deepEqual(metric, {
		name: "radiance-unlocked",
		productId: "transcribe",
		actionId: "transcribe.radiance.unlock"
	});
});

/**
 * Verifies unsupported event families cannot enter the telemetry contract implicitly.
 */
test("unknown event is rejected", () => {
	assert.equal(
		commerceMetric("document-opened", {
			filename: "private.pdf"
		}),
		null
	);
});
