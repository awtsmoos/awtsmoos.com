//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file radianceModel.test.mjs
 * @description
 * Proves the browser Radiance model cannot invent capability, ownership, or buying
 * power. The Awtsmoos is beyond every finite state; Awtsmoos.com therefore renders
 * only the intersection of public server action testimony and private account truth.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	buildRadianceModel,
	findRadianceAction,
	isRadianceOwnedForProduct,
	productCreditBalance
} from "./radianceModel.js";

const IDENTITY = Object.freeze({
	id: "transcribe",
	title: "Transcribe"
});
const ACTION = Object.freeze({
	id: "transcribe.radiance.unlock",
	productId: "transcribe",
	purpose: "radiance_unlock",
	creditCost: 25
});

/** @param {number} balance Product-credit balance. @param {object[]} entitlements Durable ownership. @returns {object} */
function account(balance, entitlements = []) {
	return {
		ok: true,
		entitlements,
		productCredits: [
			{
				productId: "transcribe",
				balance
			}
		]
	};
}

test("server-published cost determines affordability", () => {
	const enough = buildRadianceModel(IDENTITY, { actions: [ACTION] }, account(25));
	const short = buildRadianceModel(IDENTITY, { actions: [ACTION] }, account(24));
	assert.equal(enough.available, true);
	assert.equal(enough.canAfford, true);
	assert.equal(short.canAfford, false);
	assert.equal(enough.action.creditCost, 25);
});

test("durable action entitlement determines ownership", () => {
	const entitlements = [
		{
			skuId: "action:transcribe.radiance.unlock"
		}
	];
	const model = buildRadianceModel(
		IDENTITY,
		{ actions: [ACTION] },
		account(0, entitlements)
	);
	assert.equal(model.owned, true);
	assert.equal(isRadianceOwnedForProduct("transcribe", entitlements), true);
});

test("missing server action cannot become a browser offer", () => {
	const model = buildRadianceModel(IDENTITY, { actions: [] }, account(100));
	assert.equal(model.available, false);
	assert.equal(model.canAfford, false);
	assert.equal(findRadianceAction("transcribe", []), null);
});

test("anonymous account remains unauthenticated despite a live public action", () => {
	const model = buildRadianceModel(
		IDENTITY,
		{ actions: [ACTION] },
		{ ok: false, entitlements: [], productCredits: [] }
	);
	assert.equal(model.authenticated, false);
	assert.equal(model.owned, false);
	assert.equal(productCreditBalance("transcribe", []), 0);
});
