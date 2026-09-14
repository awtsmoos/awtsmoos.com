//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file transactionLabel.test.mjs
 * @description
 * Proves Wallet ledger labels reveal useful public provenance without exposing
 * private account identifiers. The Awtsmoos is beyond every finite transaction;
 * Awtsmoos.com keeps purchase, gift, reward, and transfer language exact.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { transactionLabel } from "../scripts/transactionLabel.js";

/** Transfer labels use only the public counterparty alias. */
test("labels transfers with public aliases", () => {
	assert.equal(transactionLabel({
		type: "transfer_out",
		meta: { recipientAlias: "friend" }
	}), "Sent to @friend");
	assert.equal(transactionLabel({
		type: "transfer_in",
		meta: { senderAlias: "giver" }
	}), "Received from @giver");
});

/** Verified purchased value remains visibly different from promotional credit. */
test("labels purchased and promotional credit provenance", () => {
	assert.equal(transactionLabel({
		type: "credit",
		meta: { kind: "paypal_capture", balanceKind: "purchased" }
	}), "PayPal purchased Perutas");
	assert.equal(transactionLabel({
		type: "credit",
		meta: { balanceKind: "promotional" }
	}), "Promotional credit");
});

/** Game rewards identify the game while remaining promotional value. */
test("labels game rewards", () => {
	assert.equal(transactionLabel({
		type: "credit",
		meta: { kind: "game_reward", gameId: "pong" }
	}), "Pong reward");
});

/** Durable commerce purchases become readable without a second catalog fetch. */
test("labels durable commerce purchases from stable SKU identity", () => {
	assert.equal(transactionLabel({
		type: "spend",
		meta: {
			kind: "commerce_purchase",
			skuId: "wallet.treasury.gold.001"
		}
	}), "Purchased Wallet Treasury Gold");
});

/** Product-credit pack labels disclose both quantity and owning product. */
test("labels product-credit pack purchases", () => {
	assert.equal(transactionLabel({
		type: "spend",
		meta: {
			kind: "commerce_credit_pack",
			productId: "docs",
			creditUnits: 250
		}
	}), "250 Docs credits");
});