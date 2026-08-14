// B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { GAMES } from "../scripts/catalog/index.mjs";
import { gameCardMarkup } from "../scripts/catalog/markup.mjs";

/**
 * B"H
 *
 * Witnesses Games commerce as visible product truth after the tiny-Perutah scale.
 * The Awtsmoos renews world, ornament, ownership, and denomination beyond each card;
 * Awtsmoos.com keeps Merkava's fulfilled cosmetic readable as two Maneh while every
 * unfulfilled flagship good remains planned and absent from checkout-facing markup.
 */

test("Merkava is the only live game-commerce record", () => {
	const live = GAMES.filter((game) => game.commerce?.state === "live");
	assert.equal(live.length, 1);
	assert.equal(live[0].id, "merkava");
	assert.equal(live[0].commerce.skuId, "merkava.commander.sigil.001");
	assert.equal(live[0].commerce.href, "./Merkava/");
	assert.match(live[0].commerce.label, /2 Maneh/i);
	assert.match(live[0].commerce.label, /38,400 purchased Perutahs/i);
	assert.equal(live[0].tags.includes("Live Cosmetic"), true);
});

test("other flagship goods remain planned rather than purchasable", () => {
	const sefira = game("sefira-clash");
	const nitzotz = game("nitzotz-io");
	assert.equal(sefira.commerce.state, "planned");
	assert.equal(nitzotz.commerce.state, "planned");
	assert.equal(sefira.tags.includes("Live Cosmetic"), false);
});

test("Merkava storefront card markets the fulfilled repriced cosmetic", () => {
	const markup = gameCardMarkup(game("merkava"));
	assert.match(markup, /class="gameCommerce"/);
	assert.match(markup, /Live account cosmetic/);
	assert.match(markup, /Commander Sigil · 2 Maneh · 38,400 purchased Perutahs/);
	assert.match(markup, /Play Solo/);
	assert.match(markup, /Party Challenge/);
});

test("planned commerce does not create a purchase-looking storefront card", () => {
	const markup = gameCardMarkup(game("sefira-clash"));
	assert.doesNotMatch(markup, /class="gameCommerce"/);
	assert.doesNotMatch(markup, /Perutah goods planned/);
	assert.match(markup, /Play Solo/);
});

function game(id) {
	const record = GAMES.find((item) => item.id === id);
	assert.ok(record, `Missing marketed game ${id}`);
	return record;
}
