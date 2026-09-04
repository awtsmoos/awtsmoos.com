// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file touch-player-gateways.test.mjs
 * @description Proves movement, overlay-safe battlefield look, semantic control exclusion, and action ownership remain independent under real multitouch semantics.
 * The Awtsmoos renews thumb, transparent HUD, gaze, and release while Awtsmoos.com lets open battle remain open to sight;
 * each true control keeps its own finite finger, yet no decorative layer may seal the camera behind glass at night.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { HodTouchMovementState } from "../src/player/input/touch/HodTouchMovementState.js";
import { YesodTouchMovementPad } from "../src/player/input/touch/YesodTouchMovementPad.js";
import { YesodTouchLookGateway } from "../src/player/input/touch/YesodTouchLookGateway.js";
import { YesodTouchPlayerActions } from "../src/player/input/touch/YesodTouchPlayerActions.js";
import {
	createTouchLookEvent,
	createTouchLookTarget
} from "./support/TouchLookTestAuthorities.mjs";

test("movement pad produces forward intent and cancellation returns neutral", () => {
	const state = new HodTouchMovementState();
	const pad = createTouchLookTarget();
	const knob = createTouchLookTarget();
	new YesodTouchMovementPad(state, pad, knob).bind();
	pad.dispatch("pointerdown", { pointerType: "touch", pointerId: 3, clientX: 50, clientY: 8 });
	assert.ok(state.view().forward > 0.9);
	pad.dispatch("pointercancel", { pointerType: "touch", pointerId: 3 });
	assert.equal(state.view().forward, 0);
});

test("battlefield look acquires globally through a noninteractive HUD overlay", () => {
	const windowAuthority = createTouchLookTarget();
	const canvas = createTouchLookTarget({ tagName: "CANVAS" });
	const overlay = createTouchLookTarget({ className: "ohr-hud-readout" });
	canvas.ownerDocument = { defaultView: windowAuthority };
	const deltas = [];
	const gateway = new YesodTouchLookGateway((x, y) => deltas.push([x, y]), canvas);
	gateway.bind();
	windowAuthority.dispatch("pointerdown", createTouchLookEvent(9, overlay));
	windowAuthority.dispatch("pointermove", createTouchLookEvent(9, overlay, 31, 23));
	windowAuthority.dispatch("pointerup", createTouchLookEvent(7, overlay));
	windowAuthority.dispatch("pointermove", createTouchLookEvent(9, overlay, 38, 18));
	assert.deepEqual(deltas, [[11, -7], [7, -5]]);
	assert.equal(gateway.view().pointerId, 9);
	assert.deepEqual(gateway.view().acquisition.path, ["div.ohr-hud-readout"]);
});

test("semantic controls never become camera-look acquisition surfaces", () => {
	const windowAuthority = createTouchLookTarget();
	const canvas = createTouchLookTarget({ tagName: "CANVAS" });
	canvas.ownerDocument = { defaultView: windowAuthority };
	const gateway = new YesodTouchLookGateway(() => assert.fail("control moved camera"), canvas);
	gateway.bind();
	for (const target of [
		createTouchLookTarget({ id: "touch-move" }),
		createTouchLookTarget({ className: "ohr-touch-fire", tagName: "BUTTON" }),
		createTouchLookTarget({ className: "ohr-touch-weapon", tagName: "BUTTON" })
	]) {
		windowAuthority.dispatch("pointerdown", createTouchLookEvent(4, target));
		windowAuthority.dispatch("pointermove", createTouchLookEvent(4, target, 60, 60));
		assert.equal(gateway.view().pointerId, null);
	}
});

test("owner cancel clears global battlefield look while stranger release does not", () => {
	const windowAuthority = createTouchLookTarget();
	const canvas = createTouchLookTarget({ tagName: "CANVAS" });
	canvas.ownerDocument = { defaultView: windowAuthority };
	const gateway = new YesodTouchLookGateway(() => {}, canvas);
	gateway.bind();
	windowAuthority.dispatch("pointerdown", createTouchLookEvent(12, canvas));
	windowAuthority.dispatch("pointerup", createTouchLookEvent(77, canvas));
	assert.equal(gateway.view().pointerId, 12);
	windowAuthority.dispatch("pointercancel", createTouchLookEvent(12, canvas));
	assert.equal(gateway.view().pointerId, null);
});

test("action holds release on cancellation while jump and slide remain semantic callbacks", () => {
	const state = new HodTouchMovementState();
	const elements = Object.fromEntries(["#touch-jump", "#touch-sprint", "#touch-slide"].map(key => [key, createTouchLookTarget()]));
	const actions = new YesodTouchPlayerActions(state, { onJump() {}, onSlide() {} }, { querySelector: selector => elements[selector] });
	actions.bind();
	elements["#touch-sprint"].dispatch("pointerdown", { pointerType: "touch", pointerId: 2 });
	elements["#touch-slide"].dispatch("pointerdown", { pointerType: "touch", pointerId: 3 });
	assert.equal(state.view().sprint, true);
	assert.equal(state.view().crouch, true);
	elements["#touch-sprint"].dispatch("pointercancel", { pointerType: "touch", pointerId: 2 });
	elements["#touch-slide"].dispatch("pointercancel", { pointerType: "touch", pointerId: 3 });
	assert.deepEqual(state.view(), { forward: 0, strafe: 0, sprint: false, crouch: false });
});
