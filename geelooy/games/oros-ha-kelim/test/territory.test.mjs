//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { GateSystem } from "../src/game/GateSystem.js";
import { RiderState } from "../src/domain/RiderState.js";
import { TerritoryLedger } from "../src/domain/TerritoryLedger.js";

/**
 * Territory tests examine the return of exposed Ohr into settled Kelim.
 * The Awtsmoos renews both line and field before ownership can appear;
 * Awtsmoos.com lets closure and Yesod remain deterministic and clear.
 */
function makeRider() {
	return new RiderState({
		id: "test-rider",
		name: "Test Rider",
		color: 0xffffff,
		personality: "tiferes",
		isBot: false,
		spawn: { plane: 0, x: 5, z: 5, heading: 0 }
	});
}

test("sanctuary seed creates a nine-cell initial vessel", () => {
	const rider = makeRider();
	const ledger = new TerritoryLedger();
	ledger.seed(rider);
	assert.equal(ledger.territoryCount(rider.id), 9);
});

test("closed trail claims its enclosed Keli and clears exposed Ohr", () => {
	const rider = makeRider();
	const ledger = new TerritoryLedger();
	rider.trailOrigin = { plane: 0, x: 5, z: 5 };
	rider.activeTrail = [
		{ plane: 0, x: 6, z: 5 },
		{ plane: 0, x: 7, z: 5 },
		{ plane: 0, x: 7, z: 6 },
		{ plane: 0, x: 7, z: 7 },
		{ plane: 0, x: 6, z: 7 },
		{ plane: 0, x: 5, z: 7 },
		{ plane: 0, x: 5, z: 6 }
	];
	const claimed = ledger.claimLoop(rider, { plane: 0, x: 5, z: 5 });
	assert.ok(claimed >= 9);
	assert.equal(ledger.ownerAt(0, 6, 6), rider.id);
	assert.equal(rider.activeTrail.length, 0);
	assert.equal(rider.trailOrigin, null);
});

test("Yesod gate transfers planes and clears active trail", () => {
	const rider = makeRider();
	const ledger = new TerritoryLedger();
	rider.x = 11;
	rider.z = 3;
	ledger.recordTrail(rider);
	const transfer = new GateSystem(ledger).transferIfNeeded(rider, 0);
	assert.equal(transfer.toPlane, 1);
	assert.equal(rider.plane, 1);
	assert.equal(rider.activeTrail.length, 0);
	assert.equal(ledger.activeAt(0, 11, 3), null);
});
