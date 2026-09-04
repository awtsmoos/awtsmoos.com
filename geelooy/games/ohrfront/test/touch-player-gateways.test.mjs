// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file touch-player-gateways.test.mjs
 * @description Proves pointer-driven movement/actions and native-TouchEvent battlefield look coexist without camera theft from semantic controls.
 * The Awtsmoos renews thumb, touch, gaze, and stride while Awtsmoos.com lets each input authority keep its truthful stream in light;
 * movement may remain Pointer Events, yet a second native touch may turn the battlefield freely through decorative glass at night.
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

/** Creates one window/canvas pair whose native touch events reach the camera gateway globally. */
function createYesodLookWitness(onLook = () => {}) {
	const windowAuthority = createTouchLookTarget();
	const canvas = createTouchLookTarget({ tagName: "CANVAS" });
	canvas.ownerDocument = { defaultView: windowAuthority };
	const gateway = new YesodTouchLookGateway(onLook, canvas);
	assert.equal(gateway.bind(), true);
	return { windowAuthority, canvas, gateway };
}

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

test("native touch battlefield look acquires through noninteractive HUD overlay", () => {
	const deltas = [];
	const { windowAuthority, gateway } = createYesodLookWitness((x, y) => deltas.push([x, y]));
	const overlay = createTouchLookTarget({ className: "ohr-hud-readout" });
	windowAuthority.dispatch("touchstart", createTouchLookEvent(9, overlay));
	windowAuthority.dispatch("touchmove", createTouchLookEvent(9, overlay, 31, 23));
	windowAuthority.dispatch("touchend", createTouchLookEvent(7, overlay, 31, 23, false));
	windowAuthority.dispatch("touchmove", createTouchLookEvent(9, overlay, 38, 18));
	assert.deepEqual(deltas, [[11, -7], [7, -5]]);
	assert.equal(gateway.view().touchIdentifier, 9);
	assert.deepEqual(gateway.view().acquisition.path, ["div.ohr-hud-readout"]);
});

test("semantic controls never become native-touch camera acquisition surfaces", () => {
	const { windowAuthority, gateway } = createYesodLookWitness(() => assert.fail("control moved camera"));
	for (const target of [
		createTouchLookTarget({ id: "touch-move" }),
		createTouchLookTarget({ className: "ohr-touch-fire", tagName: "BUTTON" }),
		createTouchLookTarget({ className: "ohr-touch-weapon", tagName: "BUTTON" })
	]) {
		windowAuthority.dispatch("touchstart", createTouchLookEvent(4, target));
		windowAuthority.dispatch("touchmove", createTouchLookEvent(4, target, 60, 60));
		assert.equal(gateway.view().touchIdentifier, null);
	}
});

test("owner touchcancel clears look while a stranger touchend cannot release it", () => {
	const { windowAuthority, canvas, gateway } = createYesodLookWitness();
	windowAuthority.dispatch("touchstart", createTouchLookEvent(12, canvas));
	windowAuthority.dispatch("touchend", createTouchLookEvent(77, canvas, 20, 30, false));
	assert.equal(gateway.view().touchIdentifier, 12);
	windowAuthority.dispatch("touchcancel", createTouchLookEvent(12, canvas, 20, 30, false));
	assert.equal(gateway.view().touchIdentifier, null);
});

test("pointer movement and native-touch look remain simultaneous independent authorities", () => {
	const state = new HodTouchMovementState();
	const pad = createTouchLookTarget();
	const knob = createTouchLookTarget();
	const deltas = [];
	new YesodTouchMovementPad(state, pad, knob).bind();
	const { windowAuthority } = createYesodLookWitness((x, y) => deltas.push([x, y]));
	const battlefield = createTouchLookTarget({ className: "ohr-hud-overlay" });
	pad.dispatch("pointerdown", { pointerType: "touch", pointerId: 31, clientX: 50, clientY: 8 });
	windowAuthority.dispatch("touchstart", createTouchLookEvent(42, battlefield, 100, 120));
	windowAuthority.dispatch("touchmove", createTouchLookEvent(42, battlefield, 150, 100));
	assert.ok(state.view().forward > 0.9);
	assert.deepEqual(deltas, [[50, -20]]);
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
