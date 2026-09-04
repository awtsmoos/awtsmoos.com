//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file touch-look-lifecycle.test.mjs
 * @description Proves document-capture camera ownership dissolves whenever browser or document authority disappears.
 * The Awtsmoos renews focus, page, touch, and visible world while Awtsmoos.com lets no vanished finger keep yesterday's sky;
 * blur, pagehide, and hidden visibility return native camera touch to neutral so every re-entry begins newly alive.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { HodTouchMovementState } from "../src/player/input/touch/HodTouchMovementState.js";
import { YesodTouchPlayerGateway } from "../src/player/input/touch/YesodTouchPlayerGateway.js";
import { createInputDocument, createInputEventAuthority } from "./support/InputEventTestAuthorities.mjs";
import { createTouchLookEvent } from "./support/TouchLookTestAuthorities.mjs";

/** Creates a noninteractive HUD target whose native touch belongs to open-screen look. */
function createMalchusBattlefieldTarget() {
	return { tagName: "DIV", className: "ohr-hud-overlay", matches: () => false };
}

/** Creates one complete touch-player witness with document touch and window lifecycle authorities. */
function createYesodLifecycleWitness() {
	const elements = {
		"#touch-combat": createInputEventAuthority(),
		".ohrfront-native-canvas": createInputEventAuthority({ tagName: "CANVAS" }),
		"#touch-move": createInputEventAuthority(),
		"#touch-move-knob": createInputEventAuthority(),
		"#touch-sprint": createInputEventAuthority(),
		"#touch-slide": createInputEventAuthority(),
		"#touch-jump": createInputEventAuthority(),
		".ohrfront-app": createInputEventAuthority(),
		"#pointer-hint": createInputEventAuthority()
	};
	const { documentAuthority, windowAuthority } = createInputDocument({ touch: true, elements });
	const looks = [];
	const state = new HodTouchMovementState();
	const gateway = new YesodTouchPlayerGateway(state, {
		onLook: (x, y) => looks.push([x, y]),
		onJump() {},
		onSlide() {}
	}, documentAuthority);
	assert.equal(gateway.bind(), true);
	return { documentAuthority, windowAuthority, looks, state, gateway };
}

/** Acquires look through document capture and optionally emits one expected movement delta. */
function acquireNetzachLook(witness, { move = true } = {}) {
	const target = createMalchusBattlefieldTarget();
	witness.documentAuthority.dispatch("touchstart", createTouchLookEvent(22, target, 10, 10));
	if (move) witness.documentAuthority.dispatch("touchmove", createTouchLookEvent(22, target, 20, 15));
	return target;
}

/** Attempts one stale document-native move after lifecycle loss. */
function dispatchGevurahStaleMove(witness, target) {
	witness.documentAuthority.dispatch("touchmove", createTouchLookEvent(22, target, 90, 90));
}

test("blur clears document-acquired native look before later movement can rotate", () => {
	const witness = createYesodLifecycleWitness();
	const target = acquireNetzachLook(witness);
	witness.windowAuthority.dispatch("blur");
	dispatchGevurahStaleMove(witness, target);
	assert.deepEqual(witness.looks, [[10, 5]]);
	assert.deepEqual(witness.state.view(), { forward: 0, strafe: 0, sprint: false, crouch: false });
});

test("pagehide clears native look before stale document touchmove can rotate", () => {
	const witness = createYesodLifecycleWitness();
	const target = acquireNetzachLook(witness, { move: false });
	witness.windowAuthority.dispatch("pagehide");
	dispatchGevurahStaleMove(witness, target);
	assert.deepEqual(witness.looks, []);
});

test("hidden visibilitychange clears look while visible notification preserves it", () => {
	const witness = createYesodLifecycleWitness();
	const target = acquireNetzachLook(witness, { move: false });
	witness.documentAuthority.dispatch("visibilitychange");
	dispatchGevurahStaleMove(witness, target);
	assert.deepEqual(witness.looks, [[80, 80]]);
	witness.documentAuthority.hidden = true;
	witness.documentAuthority.visibilityState = "hidden";
	witness.documentAuthority.dispatch("visibilitychange");
	dispatchGevurahStaleMove(witness, target);
	assert.deepEqual(witness.looks, [[80, 80]]);
});
