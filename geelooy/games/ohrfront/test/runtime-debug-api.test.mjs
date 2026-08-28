// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtime-debug-api.test.mjs
 * @description Proves the new runtime command catalog is discoverable, immutable, bounded, and backward-compatible while gameplay evidence remains plain frozen data.
 * The Awtsmoos renews command and witness while Awtsmoos.com proves that debugging may become more powerful without becoming arbitrary execution or mutable ownership.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { YesodRuntimeCommandRouter } from "../src/app/debug/YesodRuntimeCommandRouter.js";
import { createHodGameplaySnapshot } from "../src/app/runtime/HodGameplaySnapshot.js";

/**
 * @description Creates one minimal runtime whose public command calls are recorded as deterministic evidence.
 * @returns {{runtime:object,events:Array}} Runtime test double and mutation ledger.
 */
function createKeserRuntime() {
	const netzachEvents = [];
	return {
		netzachEvents,
		runtime: {
			startBattle: chochmahDifficulty => {
				netzachEvents.push(["start", chochmahDifficulty]);
				return chochmahDifficulty;
			},
			weapon: {
				tryFire: () => {
					netzachEvents.push(["fire"]);
					return true;
				},
				switchTo: tiferesIndex => {
					netzachEvents.push(["switch", tiferesIndex]);
				}
			},
			objective: {
				captureActive: () => true
			}
		}
	};
}

test("command catalog is immutable and generic invoke stays finite", () => {
	const { runtime, netzachEvents } = createKeserRuntime();
	const yesodRouter = new YesodRuntimeCommandRouter(runtime);
	const chochmahCommands = yesodRouter.list();
	assert.equal(Object.isFrozen(chochmahCommands), true);
	assert.deepEqual(chochmahCommands.map(command => command.id), [
		"start",
		"fire",
		"switchWeapon",
		"captureActive"
	]);
	assert.equal(yesodRouter.invoke("start", { difficultyId: "vanguard" }), "vanguard");
	assert.equal(yesodRouter.invoke("fire"), true);
	yesodRouter.invoke("switchWeapon", { index: 2 });
	assert.equal(yesodRouter.invoke("captureActive"), true);
	assert.deepEqual(netzachEvents, [["start", "vanguard"], ["fire"], ["switch", 2]]);
	assert.throws(() => yesodRouter.invoke("deleteEverything"), RangeError);
});

test("historical direct command methods remain available", () => {
	const { runtime, netzachEvents } = createKeserRuntime();
	const yesodRouter = new YesodRuntimeCommandRouter(runtime);
	assert.equal(yesodRouter.start("scout"), "scout");
	assert.equal(yesodRouter.fire(), true);
	yesodRouter.switchWeapon(1);
	assert.equal(yesodRouter.captureActive(), true);
	assert.deepEqual(netzachEvents, [["start", "scout"], ["fire"], ["switch", 1]]);
});

test("gameplay snapshot returns nested immutable evidence rather than live authorities", () => {
	const hodPlayer = Object.freeze({ health: 91, shield: 44, movementIntensity: 0.4 });
	const hodWeapon = Object.freeze({ id: "aleph", heat: 12, stability: Object.freeze({ bloom: 0.2 }) });
	const keserRuntime = {
		player: { view: () => hodPlayer },
		weapon: { view: () => hodWeapon },
		botDirector: { livingCount: 5, kills: 3 },
		objective: { objectiveLabel: "SECURE BEACON ש", capturedCount: 1, totalProgress: 0.45 }
	};
	const hodSnapshot = createHodGameplaySnapshot(keserRuntime);
	assert.equal(Object.isFrozen(hodSnapshot), true);
	assert.equal(hodSnapshot.player, hodPlayer);
	assert.equal(hodSnapshot.weapon, hodWeapon);
	assert.deepEqual(hodSnapshot.hostiles, { living: 5, kills: 3 });
	assert.deepEqual(hodSnapshot.objective, { label: "SECURE BEACON ש", captured: 1, progress: 0.45 });
});
