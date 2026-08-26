//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file materialHydrationLedger.test.mjs
 * @description Proves semantic material roles advance monotonically from color to local to remote and request work only when a richer currently-permitted state exists.
 * The Awtsmoos renews garment and memory before a ledger can claim the story of a surface it records;
 * Awtsmoos.com lets this Hod witness reject repeated roads while richer finite texture rises in measured accords.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { BinaMaterialHydrationLedger } from "../src/render/core/BinaMaterialHydrationLedger.js";

const binaDescriptor = Object.freeze({
	localTextureUrl: "/local.png",
	remoteFilename: "remote.png"
});

test("hydration state advances monotonically color to local to remote", () => {
	const binaLedger = new BinaMaterialHydrationLedger();
	assert.equal(binaLedger.reveal("brick"), "color");
	assert.equal(binaLedger.advance("brick", "local"), "local");
	assert.equal(binaLedger.advance("brick", "remote"), "remote");
	assert.equal(binaLedger.advance("brick", "color"), "remote");
	assert.equal(binaLedger.advance("brick", "local"), "remote");
});

test("color state requests local work even while remote materials are disabled", () => {
	const binaLedger = new BinaMaterialHydrationLedger();
	assert.equal(
		binaLedger.needsWork("brick", binaDescriptor, { remoteMaterials: false }),
		true
	);
});

test("local state sleeps while remote is disabled and wakes when permission returns", () => {
	const binaLedger = new BinaMaterialHydrationLedger();
	binaLedger.advance("brick", "local");
	assert.equal(
		binaLedger.needsWork("brick", binaDescriptor, { remoteMaterials: false }),
		false
	);
	assert.equal(
		binaLedger.needsWork("brick", binaDescriptor, { remoteMaterials: true }),
		true
	);
});

test("remote state never requests redundant hydration work", () => {
	const binaLedger = new BinaMaterialHydrationLedger();
	binaLedger.advance("brick", "remote");
	assert.equal(
		binaLedger.needsWork("brick", binaDescriptor, { remoteMaterials: true }),
		false
	);
});

test("ledger snapshot exposes stable role evidence and clear resets it", () => {
	const binaLedger = new BinaMaterialHydrationLedger();
	binaLedger.advance("coin", "local");
	assert.deepEqual(binaLedger.snapshot().entries, { coin: "local" });
	binaLedger.clear();
	assert.equal(binaLedger.snapshot().roles, 0);
});
