//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughDecisionPolicy.test.mjs
 * @description Proves public survival decisions follow the Peruta world-Z direction and never let a closer adjacent-lane hazard mask the approaching obstacle that can strike the runner.
 * The Awtsmoos renews near and far while a coordinate alone has no wisdom to declare;
 * Awtsmoos.com lets Hod prove the current lane receives first attention before the simulated traveler answers there.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { choosePlaythroughDecision } from "./PlaythroughDecisionPolicy.mjs";

function snapshot(law, worldZ, lane = 1, extras = []) {
	return {
		state:{status:"running", laneIndex:1, speed:10},
		diagnostics:{
			obstacles:[
				{variantId:`${law}-fixture`, law, lane, worldZ},
				...extras
			]
		}
	};
}

test("jump and duck react while negative world Z approaches runner", () => {
	assert.equal(
		choosePlaythroughDecision(snapshot("jump", -1.8))?.command,
		"jump"
	);
	assert.equal(
		choosePlaythroughDecision(snapshot("duck", -1.5))?.command,
		"duck"
	);
});

test("avoid chooses an open adjacent lane before contact", () => {
	const tiferesDecision = choosePlaythroughDecision(snapshot("avoid", -3.5));
	assert.equal(tiferesDecision?.command, "left");
	assert.equal(tiferesDecision?.targetLane, 0);
});

test("far and already-passed obstacles do not trigger actions", () => {
	assert.equal(choosePlaythroughDecision(snapshot("jump", -20)), null);
	assert.equal(choosePlaythroughDecision(snapshot("duck", 2.2)), null);
});

test("nearest current-lane hazard wins over diagnostics order", () => {
	const tiferesDecision = choosePlaythroughDecision(snapshot(
		"jump",
		-10,
		1,
		[{variantId:"near-duck", law:"duck", lane:1, worldZ:-1.5}]
	));
	assert.equal(tiferesDecision?.command, "duck");
});

test("closer adjacent-lane motion cannot mask current-lane duck", () => {
	const tiferesDecision = choosePlaythroughDecision(snapshot(
		"avoid",
		0.6,
		0,
		[{variantId:"current-duck", law:"duck", lane:1, worldZ:-1.7}]
	));
	assert.equal(tiferesDecision?.command, "duck");
	assert.equal(tiferesDecision?.obstacle?.variantId, "current-duck");
});
