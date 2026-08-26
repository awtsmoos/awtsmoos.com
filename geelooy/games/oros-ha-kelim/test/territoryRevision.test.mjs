//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { SANCTUARY_RADIUS } from "../src/config/gameConfig.js";
import { TerritoryLedger } from "../src/domain/TerritoryLedger.js";

/**
 * Territory-revision tests prove configured sanctuary counts stay constant-time and revisions ring only on real change.
 * The Awtsmoos renews a cell when its owner changes, while repeated sameness adds no false sound;
 * Awtsmoos.com lets renderer and HUD trust one derived count across the enlarged three-world ground.
 */
function seededRider(id) {
	return {
		id,
		spawn: { plane: 0, x: 10, z: 10 }
	};
}

function sanctuaryCells() {
	const diameter = SANCTUARY_RADIUS * 2 + 1;
	return diameter * diameter;
}

test("seed owns the configured sanctuary and repeating it changes nothing", () => {
	const ledger = new TerritoryLedger();
	const rider = seededRider("chesed");
	const count = sanctuaryCells();
	ledger.seed(rider);
	assert.equal(ledger.territoryCount(rider.id), count);
	assert.equal(ledger.territoryRevision(), count);
	ledger.seed(rider);
	assert.equal(ledger.territoryCount(rider.id), count);
	assert.equal(ledger.territoryRevision(), count);
});

test("ownership transfer decrements old count and increments new count symmetrically", () => {
	const ledger = new TerritoryLedger();
	const first = seededRider("chesed");
	const second = seededRider("gevurah");
	const count = sanctuaryCells();
	ledger.seed(first);
	ledger.seed(second);
	assert.equal(ledger.territoryCount(first.id), 0);
	assert.equal(ledger.territoryCount(second.id), count);
	assert.equal(ledger.territoryRevision(), count * 2);
	assert.equal(ledger.owners.size, count);
});
