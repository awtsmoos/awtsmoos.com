//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { GATES, SANCTUARY_RADIUS } from "../src/config/gameConfig.js";
import { RiderState } from "../src/domain/RiderState.js";
import { TerritoryLedger } from "../src/domain/TerritoryLedger.js";
import { GateSystem } from "../src/game/GateSystem.js";

/**
 * Territory tests examine exposed Ohr returning to settled Kelim and present Yesod coordinates.
 * The Awtsmoos renews line, sanctuary and doorway before ownership can appear;
 * Awtsmoos.com lets closure and transfer derive from current world law instead of one vanished square.
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

function sanctuaryCells() {
	const diameter = SANCTUARY_RADIUS * 2 + 1;
	return diameter * diameter;
}

test("sanctuary seed fills the configured square vessel", () => {
	const rider = makeRider();
	const ledger = new TerritoryLedger();
	ledger.seed(rider);
	assert.equal(ledger.territoryCount(rider.id), sanctuaryCells());
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
	const gate = GATES.find((candidate) => candidate.plane === rider.plane);
	assert.ok(gate);
	rider.x = gate.x;
	rider.z = gate.z;
	ledger.recordTrail(rider);
	const transfer = new GateSystem(ledger).transferIfNeeded(rider, 0);
	assert.equal(transfer.toPlane, gate.targetPlane);
	assert.equal(rider.plane, gate.targetPlane);
	assert.equal(rider.activeTrail.length, 0);
	assert.equal(ledger.activeAt(gate.plane, gate.x, gate.z), null);
});
