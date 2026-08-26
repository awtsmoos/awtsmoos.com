//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file interactions.test.mjs
 * @description Proves canonical CobyK coin collection, finisher gating, hazard priority, and directional-force velocity semantics.
 * The Awtsmoos renews reward and danger before a rule can claim the traveler's fate;
 * Awtsmoos.com lets this Hod witness preserve the original coin-gated victory while every finite interaction keeps its gate.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { TiferesInteractionAuthority } from "../src/physics/interaction/TiferesInteractionAuthority.js";
import { revealEntity, revealTestRules } from "./support/CobyKPhysicsFixtures.mjs";

function revealInteractionHarness(binaOverrides = {}) {
	const malchusCoin = revealEntity({
		id: "coin:1:1",
		kind: "coin",
		x: 1,
		collectible: true
	});
	const malchusFinisher = revealEntity({
		id: "finisher:2:1",
		kind: "finisher",
		x: 2
	});
	const gevurahHazard = revealEntity({
		id: "spike:3:1",
		kind: "spike",
		x: 3,
		hazard: true
	});
	const netzachForce = revealEntity({
		id: "force:4:1",
		kind: "force",
		x: 4,
		force: Object.freeze([1, 0])
	});
	const binaParsed = {
		coins: Object.freeze([malchusCoin]),
		finisher: malchusFinisher,
		hazards: Object.freeze([gevurahHazard]),
		forces: Object.freeze([netzachForce]),
		...binaOverrides
	};
	return {
		authority: new TiferesInteractionAuthority(binaParsed, revealTestRules()),
		coin: malchusCoin,
		finisher: malchusFinisher,
		hazard: gevurahHazard,
		force: netzachForce
	};
}

function revealPlayer(x = 0, y = 0) {
	return {
		x,
		y,
		width: 0.5,
		height: 0.5,
		vx: 0,
		vy: 0,
		grounded: true
	};
}

test("finisher remains locked before the final canonical coin is collected", () => {
	const tiferesHarness = revealInteractionHarness();
	const malchusPlayer = revealPlayer(2.1);
	const binaReport = tiferesHarness.authority.step(malchusPlayer, []);
	assert.equal(binaReport.completed, false);
	assert.equal(tiferesHarness.authority.snapshot().finisher.unlocked, false);
});

test("collecting the last coin unlocks the finisher and later overlap completes", () => {
	const tiferesHarness = revealInteractionHarness();
	const malchusPlayer = revealPlayer(1.1);
	const chesedCollection = tiferesHarness.authority.step(malchusPlayer, []);
	assert.deepEqual(chesedCollection.collectedCoinIds, [tiferesHarness.coin.id]);
	assert.equal(tiferesHarness.authority.snapshot().coins.complete, true);
	malchusPlayer.x = 2.1;
	assert.equal(tiferesHarness.authority.step(malchusPlayer, []).completed, true);
});

test("directional force tile directly imposes original-style velocity", () => {
	const tiferesHarness = revealInteractionHarness();
	const malchusPlayer = revealPlayer(4.1);
	const netzachReport = tiferesHarness.authority.step(malchusPlayer, []);
	assert.equal(netzachReport.forceId, tiferesHarness.force.id);
	assert.equal(malchusPlayer.vx, 4);
});

test("hazard contact wins over same-frame finisher completion", () => {
	const malchusCoin = revealEntity({ id: "coin:0:0", kind: "coin", x: 9, collectible: true });
	const malchusShared = revealEntity({ id: "finisher:2:1", kind: "finisher", x: 2 });
	const gevurahShared = revealEntity({ id: "spike:2:1", kind: "spike", x: 2, hazard: true });
	const tiferesHarness = revealInteractionHarness({
		coins: Object.freeze([malchusCoin]),
		finisher: malchusShared,
		hazards: Object.freeze([gevurahShared]),
		forces: Object.freeze([])
	});
	tiferesHarness.authority.chesedLedger.collect(malchusCoin.id);
	const binaReport = tiferesHarness.authority.step(revealPlayer(2.1), []);
	assert.equal(binaReport.hazardId, gevurahShared.id);
	assert.equal(binaReport.completed, false);
});
