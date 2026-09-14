//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { fetchPremiumStarter } from "../services/premiumStarterClient.js";

/** @file premiumStarterClient.test.mjs @description Proves protected source delivery handles ownership and validates file shape. */

test("premium client returns only the required editable source files", async () => {
	const files = { "index.html": "<h1>Hi</h1>", "styles.css": "body{}", "site.js": "//B\"H" };
	const fetchImpl = async () => ({ ok: true, status: 200, json: async () => ({ ok: true, files }) });
	assert.deepEqual(await fetchPremiumStarter("launch-pro", "Site", fetchImpl), files);
});

test("premium client turns forbidden delivery into a purchase-required code", async () => {
	const fetchImpl = async () => ({ ok: true, status: 200, json: async () => ({ ok: false, error: "digital_good_not_owned" }) });
	await assert.rejects(() => fetchPremiumStarter("launch-pro", "Site", fetchImpl), error => error.code === "PREMIUM_STARTER_PURCHASE_REQUIRED");
});


test("premium client recognizes legacy HTTP-200 login-required transport", async () => {
	const fetchImpl = async () => ({ ok: true, status: 200, json: async () => ({ ok: false, error: "login_required" }) });
	await assert.rejects(() => fetchPremiumStarter("launch-pro", "Site", fetchImpl), error => error.code === "PREMIUM_STARTER_SIGN_IN_REQUIRED");
});
