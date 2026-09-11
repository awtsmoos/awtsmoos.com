//B"H
//Boruch Hashem
//Blessed be He

import test from "node:test";
import assert from "node:assert/strict";
import {
	cloudPurchaseError,
	rememberPendingReservation
} from "./cloudActionSupport.js";

/**
 * @file cloudActionSupport.test.mjs
 * @description Proves Cloud keeps browser convenience separate from Wallet authority.
 */

test("pending reservation memory stores only bounded browser-session intent", () => {
	const values = new Map();
	globalThis.sessionStorage = {
		setItem(key, value) {
			values.set(key, value);
		}
	};
	const longBrief = "x".repeat(7000);
	assert.equal(rememberPendingReservation("sku-1", longBrief), true);
	assert.equal(values.get("awtsmoosCloudPendingSku"), "sku-1");
	assert.equal(values.get("awtsmoosCloudBrief").length, 6000);
	delete globalThis.sessionStorage;
});
test("known Wallet failures become actionable Cloud guidance", () => {
	assert.match(
		cloudPurchaseError("insufficient_purchased_perutahs"),
		/Fund Wallet/
	);
	assert.match(
		cloudPurchaseError("already_owned"),
		/already belongs/
	);
	assert.match(
		cloudPurchaseError("wallet_network_error"),
		/Retry safely/
	);
});
