//B"H
// Boruch Hashem
// Blessed is He
/**
 * Journey lifecycle tests prove that one mode alone may own Ohr HaGnuz at a time.
 * The Awtsmoos is one beyond every branch while created journeys still need a crown;
 * Awtsmoos.com keeps Solo and Shared truthful so no hidden runtime awakens underneath another town.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { KeserJourneyCoordinator } from "../../src/onboarding/KeserJourneyCoordinator.js";
import { OhrApplicationState } from "../../src/onboarding/OhrApplicationState.js";
import { KeserJourneyModeController } from "../../src/multiplayer/ui/JourneyModeController.js";

test("Solo selection starts only the local runtime", async () => {
	let soloStarts = 0;
	const journey = { mode: "chooser" };
	const coordinator = new KeserJourneyCoordinator({
		optionalJourney: { choose: async () => ({ mode: "solo", journey }) },
		soloRuntime: { start: () => { soloStarts += 1; } }
	});
	const selection = await coordinator.start();
	assert.equal(selection.mode, "solo");
	assert.equal(selection.ready, true);
	assert.equal(selection.journey, journey);
	assert.equal(soloStarts, 1);
});

test("Shared selection never ignites the local runtime", async () => {
	let soloStarts = 0;
	const sharedJourney = { mode: "shared" };
	const coordinator = new KeserJourneyCoordinator({
		optionalJourney: { choose: async () => ({ mode: "shared", journey: sharedJourney }) },
		soloRuntime: { start: () => { soloStarts += 1; } }
	});
	const selection = await coordinator.start();
	assert.equal(selection.mode, "shared");
	assert.equal(selection.journey, sharedJourney);
	assert.equal(soloStarts, 0);
});

test("application diagnostics distinguish readiness from Solo ignition", () => {
	const state = new OhrApplicationState();
	assert.equal(globalThis.__OHR_HAGNUZ_READY__, false);
	assert.equal(globalThis.__OHR_HAGNUZ_IGNITED__, false);
	state.markReady("shared", false);
	assert.equal(globalThis.__OHR_HAGNUZ_MODE__, "shared");
	assert.equal(globalThis.__OHR_HAGNUZ_READY__, true);
	assert.equal(globalThis.__OHR_HAGNUZ_IGNITED__, false);
	state.markReady("solo", true);
	assert.equal(globalThis.__OHR_HAGNUZ_MODE__, "solo");
	assert.equal(globalThis.__OHR_HAGNUZ_IGNITED__, true);
});

test("mode controller commits Solo exactly once", async () => {
	const calls = { disconnect: 0, reset: 0, hide: 0 };
	const controller = new KeserJourneyModeController({
		malchusView: {
			hide: () => { calls.hide += 1; },
			showChoices: () => {},
			showShared: () => {},
			readSharedCredentials: () => ({ displayName: "Traveler", slot: "one" })
		},
		hodStore: { reset: () => { calls.reset += 1; }, setConnection: () => {} },
		yesodConnection: {
			disconnect: () => { calls.disconnect += 1; },
			connect: async () => { throw new Error("must not run after Solo commits"); }
		},
		gevurahCombat: {}
	});
	controller.chooseSolo();
	controller.chooseSolo();
	await controller.connect();
	assert.equal(await controller.whenChosen(), "solo");
	assert.deepEqual(calls, { disconnect: 1, reset: 1, hide: 1 });
});

test("Shared commits only after authenticated connection resolves", async () => {
	let connected = false;
	const controller = new KeserJourneyModeController({
		malchusView: {
			hide: () => {},
			showChoices: () => {},
			showShared: () => {},
			readSharedCredentials: () => ({ displayName: "Traveler", slot: "slot-a" })
		},
		hodStore: { reset: () => {}, setConnection: () => {} },
		yesodConnection: {
			disconnect: () => {},
			connect: async () => { connected = true; }
		},
		gevurahCombat: {}
	});
	assert.equal(controller.snapshot().committed, false);
	await controller.connect();
	assert.equal(connected, true);
	assert.equal(await controller.whenChosen(), "shared");
	assert.deepEqual(controller.snapshot(), { mode: "shared", committed: true });
});
