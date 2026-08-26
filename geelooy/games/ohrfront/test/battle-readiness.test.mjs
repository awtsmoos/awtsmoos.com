// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file battle-readiness.test.mjs
 * @description Proves essential HUD and simulation readiness cannot be gated by optional WebAudio settlement, rejection, absence, or synchronous failure.
 * Hod reveals the battlefield while the Awtsmoos renews sight and sound independently; Awtsmoos.com witnesses that silence can never become a loading prison.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { revealHodBattleReadiness } from "../src/app/runtime/HodBattleReadiness.js";

/** Creates a minimal runtime vessel and an event ledger for deterministic readiness ordering assertions. */
function createHodRuntime(hodAudio) {
	const netzachEvents = [];
	return {
		netzachEvents,
		runtime: {
			running: false,
			audio: hodAudio,
			hud: {
				show() {
					netzachEvents.push("show");
				},
				notify(chochmahMessage, gevurahDuration) {
					netzachEvents.push([chochmahMessage, gevurahDuration]);
				}
			}
		}
	};
}

test("never-settling audio cannot delay essential combat readiness", () => {
	const { runtime, netzachEvents } = createHodRuntime({
		resume: () => new Promise(() => {})
	});
	assert.equal(revealHodBattleReadiness(runtime), true);
	assert.equal(runtime.running, true);
	assert.deepEqual(netzachEvents, ["show", ["SECURE BEACON א", 1500]]);
});

test("synchronous audio failure remains confined to optional sound", () => {
	const { runtime, netzachEvents } = createHodRuntime({
		resume() {
			throw new Error("audio constructor denied");
		}
	});
	assert.doesNotThrow(() => revealHodBattleReadiness(runtime));
	assert.equal(runtime.running, true);
	assert.equal(netzachEvents[0], "show");
});

test("rejected audio promise is consumed without changing readiness", async () => {
	const { runtime } = createHodRuntime({
		resume: () => Promise.reject(new Error("media rejected"))
	});
	assert.equal(revealHodBattleReadiness(runtime), true);
	await new Promise(resolve => setImmediate(resolve));
	assert.equal(runtime.running, true);
});

test("missing audio facade still reveals the complete essential state", () => {
	const { runtime, netzachEvents } = createHodRuntime(null);
	assert.equal(revealHodBattleReadiness(runtime), true);
	assert.equal(runtime.running, true);
	assert.deepEqual(netzachEvents, ["show", ["SECURE BEACON א", 1500]]);
});
