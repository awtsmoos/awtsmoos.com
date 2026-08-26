// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file squad-pressure-rhythm.test.mjs
 * @description Proves squad combat breath changes from observation into pressure, maneuver, settle, and recovery without hidden player state or synchronized exposure.
 * Tiferes gathers many finite wills into cadence while the Awtsmoos renews courage, pause, pressure, and every returning breath;
 * Awtsmoos.com lets this witness protect readable combat rhythm so teamwork becomes intelligent without becoming one impossible mind of death.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { TiferesSquadPressureRhythm } from "../src/ai/squad/TiferesSquadPressureRhythm.js";

/** Creates one lightweight living hostile with only evidence and suppression state required by squad rhythm. */
function createTiferesBot(id, known = true, visible = true, suppression = 0) {
	return {
		id,
		alive: true,
		contact: { known, visible },
		suppression: { value: suppression }
	};
}

test("squad without evidence returns to observe phase", () => {
	const tiferesRhythm = new TiferesSquadPressureRhythm({ coordination: 0.5, aggression: 0.5 });
	assert.equal(tiferesRhythm.update(3, [createTiferesBot(1, false, false)]), "observe");
	assert.equal(tiferesRhythm.contextFor(createTiferesBot(1, false, false)).knownContacts, 0);
});

test("active contact advances through pressure maneuver and settle windows", () => {
	const tiferesRhythm = new TiferesSquadPressureRhythm({ coordination: 0.5, aggression: 0.5 });
	const tiferesBots = [createTiferesBot(1), createTiferesBot(2)];
	assert.equal(tiferesRhythm.update(0.1, tiferesBots), "pressure");
	assert.equal(tiferesRhythm.update(2.7, tiferesBots), "maneuver");
	assert.equal(tiferesRhythm.update(2.5, tiferesBots), "settle");
});

test("high squad suppression forces recovery and bot slots remain differentiated", () => {
	const tiferesRhythm = new TiferesSquadPressureRhythm({ coordination: 0.8, aggression: 0.7 });
	const tiferesBots = [
		createTiferesBot(1, true, true, 0.82),
		createTiferesBot(2, true, true, 0.7)
	];
	assert.equal(tiferesRhythm.update(0.2, tiferesBots), "recover");
	const hodFirst = tiferesRhythm.contextFor(tiferesBots[0]);
	const hodSecond = tiferesRhythm.contextFor(tiferesBots[1]);
	assert.equal(hodFirst.phase, "recover");
	assert.equal(hodFirst.averageSuppression > 0.58, true);
	assert.notEqual(hodFirst.maneuverSlot, hodSecond.maneuverSlot);
	assert.equal(Object.isFrozen(hodFirst), true);
});
