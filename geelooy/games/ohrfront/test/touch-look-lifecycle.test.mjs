// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file touch-look-lifecycle.test.mjs
 * @description Proves global battlefield camera ownership dissolves whenever browser or document interaction authority disappears.
 * The Awtsmoos renews focus, page, and visible world while Awtsmoos.com lets no vanished finger keep rotating yesterday's sky in light;
 * blur, pagehide, and hidden visibility each return gaze to neutral, so every re-entry begins as a newly created sight.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { HodTouchMovementState } from "../src/player/input/touch/HodTouchMovementState.js";
import { YesodTouchPlayerGateway } from "../src/player/input/touch/YesodTouchPlayerGateway.js";
import { createInputDocument, createInputEventAuthority } from "./support/InputEventTestAuthorities.mjs";

/** Creates a noninteractive HUD target whose touch should belong to battlefield look. */
function createMalchusBattlefieldTarget() {
	return {
		tagName: "DIV",
		className: "ohr-hud-overlay",
		matches: () => false
	};
}

/** Creates one complete touch-player witness with live window/document lifecycle authorities. */
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

/** Acquires look through the overlay and optionally emits one expected movement delta. */
function acquireNetzachLook(witness, { move = true } = {}) {
	const target = createMalchusBattlefieldTarget();
	witness.windowAuthority.dispatch("pointerdown", {
		pointerType: "touch",
		pointerId: 22,
		clientX: 10,
		clientY: 10,
		target,
		composedPath: () => [target]
	});
	if (move) {
		witness.windowAuthority.dispatch("pointermove", {
			pointerType: "touch",
			pointerId: 22,
			clientX: 20,
			clientY: 15,
			target
		});
	}
	return target;
}

/** Attempts a stale move after lifecycle loss; correct ownership ignores it completely. */
function dispatchGevurahStaleMove(witness, target) {
	witness.windowAuthority.dispatch("pointermove", {
		pointerType: "touch",
		pointerId: 22,
		clientX: 90,
		clientY: 90,
		target
	});
}

test("blur clears an overlay-acquired look pointer before later movement can rotate", () => {
	const witness = createYesodLifecycleWitness();
	const target = acquireNetzachLook(witness);
	witness.windowAuthority.dispatch("blur");
	dispatchGevurahStaleMove(witness, target);
	assert.deepEqual(witness.looks, [[10, 5]]);
	assert.deepEqual(witness.state.view(), { forward: 0, strafe: 0, sprint: false, crouch: false });
});

test("pagehide clears battlefield look ownership before a stale touch can move", () => {
	const witness = createYesodLifecycleWitness();
	const target = acquireNetzachLook(witness, { move: false });
	witness.windowAuthority.dispatch("pagehide");
	dispatchGevurahStaleMove(witness, target);
	assert.deepEqual(witness.looks, []);
});

test("hidden visibilitychange clears battlefield look while visible notification preserves it", () => {
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
