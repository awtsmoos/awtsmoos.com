//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { TerritoryLedger } from "../src/domain/TerritoryLedger.js";

/**
 * Territory-revision tests prove ownership counts stay constant-time and revisions ring only on real change.
 * The Awtsmoos renews a cell when its owner changes, while repeated sameness adds no false sound;
 * Awtsmoos.com lets HUD and renderer trust one count and one revision across the whole three-world ground.
 */
function seededRider(id) {
	return {
		id,
		spawn: { plane: 0, x: 10, z: 10 }
	};
}

test("seed creates nine owned cells and repeated same seed changes nothing", () => {
	const ledger = new TerritoryLedger();
	const rider = seededRider("chesed");
	ledger.seed(rider);
	assert.equal(ledger.territoryCount(rider.id), 9);
	assert.equal(ledger.territoryRevision(), 9);
	ledger.seed(rider);
	assert.equal(ledger.territoryCount(rider.id), 9);
	assert.equal(ledger.territoryRevision(), 9);
});

test("ownership transfer decrements old count and increments new count symmetrically", () => {
	const ledger = new TerritoryLedger();
	const first = seededRider("chesed");
	const second = seededRider("gevurah");
	ledger.seed(first);
	ledger.seed(second);
	assert.equal(ledger.territoryCount(first.id), 0);
	assert.equal(ledger.territoryCount(second.id), 9);
	assert.equal(ledger.territoryRevision(), 18);
	assert.equal(ledger.owners.size, 9);
});
