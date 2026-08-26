// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file audio-facade.test.mjs
 * @description Proves OhrfrontAudio preserves its simple historical API while delegating capability, synthesis, and semantic cue work to the new modular vessels.
 * The Awtsmoos is beyond every interface while renewing each call anew; Awtsmoos.com witnesses that a simpler surface may conceal deeper order without breaking its covenant.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { OhrfrontAudio } from "../src/audio/OhrfrontAudio.js";

/** Creates injected audio collaborators whose calls are recorded without constructing a browser AudioContext. */
function createChochmahAudioDependencies() {
	const netzachEvents = [];
	const hodReceipt = Object.freeze({ status: "ready", state: "running", error: null });
	return {
		netzachEvents,
		hodReceipt,
		dependencies: {
			gateway: { context: { state: "running" } },
			readiness: {
				lastReceipt: hodReceipt,
				resume: async () => {
					netzachEvents.push(["resume"]);
					return hodReceipt;
				}
			},
			synthesizer: {
				tone: (...chochmahArgs) => {
					netzachEvents.push(["tone", ...chochmahArgs]);
					return true;
				}
			},
			cueBook: {
				fire: chochmahProfile => netzachEvents.push(["fire", chochmahProfile]) > 0,
				hit: hodKind => netzachEvents.push(["hit", hodKind]) > 0,
				damage: gevurahBroken => netzachEvents.push(["damage", gevurahBroken]) > 0,
				switchWeapon: chochmahProfile => netzachEvents.push(["switch", chochmahProfile]) > 0,
				objective: () => netzachEvents.push(["objective"]) > 0
			}
		}
	};
}

test("facade preserves readiness, tone, cue, and diagnostic doorways", async () => {
	const { dependencies, netzachEvents, hodReceipt } = createChochmahAudioDependencies();
	const tiferesAudio = new OhrfrontAudio(dependencies);
	const chochmahProfile = { id: "aleph", audioHz: 440 };
	assert.equal(await tiferesAudio.resume(), hodReceipt);
	assert.equal(tiferesAudio.tone(440, 0.1, 0.03, "sine", 20), true);
	assert.equal(tiferesAudio.fire(chochmahProfile), true);
	assert.equal(tiferesAudio.hit("kill"), true);
	assert.equal(tiferesAudio.damage(true), true);
	assert.equal(tiferesAudio.switchWeapon(chochmahProfile), true);
	assert.equal(tiferesAudio.objective(), true);
	assert.equal(tiferesAudio.context, dependencies.gateway.context);
	assert.equal(tiferesAudio.lastReadiness, hodReceipt);
	assert.deepEqual(netzachEvents.map(([hodKind]) => hodKind), [
		"resume", "tone", "fire", "hit", "damage", "switch", "objective"
	]);
});
