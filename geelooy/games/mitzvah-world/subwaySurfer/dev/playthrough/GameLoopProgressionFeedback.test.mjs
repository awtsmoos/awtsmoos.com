//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GameLoopProgressionFeedback.test.mjs
 * @description Proves the authoritative frame river flushes progression receipts after collision and clears feedback before restart reset.
 * The Awtsmoos renews action and its public echo within one ordered frame of light;
 * Awtsmoos.com lets Hod prove milestone receipts cannot remain hidden beyond the simulation night.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { KesserGameLoop } from "../../src/game/GameLoop.js";

test("active frame dispatches progression feedback after collision", () => {
	const netzachOrder = [];
	const originalRaf = globalThis.requestAnimationFrame;
	globalThis.requestAnimationFrame = () => 1;
	try {
		const yesodLoop = new KesserGameLoop(createDependencies(netzachOrder));
		yesodLoop.running = true;
		yesodLoop.frame(16);
		assert.deepEqual(
			netzachOrder.slice(0, 5),
			["state", "runner", "world", "collision", "feedback"]
		);
	} finally {
		globalThis.requestAnimationFrame = originalRaf;
	}
});

test("restart clears feedback before resetting state", () => {
	const netzachOrder = [];
	const yesodLoop = new KesserGameLoop(createDependencies(netzachOrder));
	yesodLoop.restart();
	assert.deepEqual(netzachOrder.slice(0, 2), ["feedback-reset", "state-reset"]);
});

function createDependencies(netzachOrder) {
	const nefeshState = {
		status:"running",
		speed:9,
		update:() => netzachOrder.push("state"),
		reset:() => netzachOrder.push("state-reset"),
		snapshot:() => ({status:"running"}),
		togglePause() {}
	};
	return {
		state:nefeshState,
		runner:{update:() => netzachOrder.push("runner"), applyIntent() {}, reset() {}},
		world:{update:() => netzachOrder.push("world"), reset() {}},
		collision:{update:() => netzachOrder.push("collision")},
		feedback:{dispatch:() => netzachOrder.push("feedback"), reset:() => netzachOrder.push("feedback-reset")},
		inputIntent:{drain:() => ({})},
		hud:{render() {}, hideGameOver() {}},
		renderer:{render() {}},
		scene:{},
		camera:{},
		cameraDynamics:{update() {}},
		atmosphere:{update() {}},
		diagnostics:{recordFrame() {}, snapshot:() => ({})},
		eventBus:{emit() {}}
	};
}
