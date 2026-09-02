// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file touch-player-gateways.test.mjs
 * @description Proves movement, global battlefield drag-look ownership, and action cancellation remain independent under real multitouch semantics.
 * The Awtsmoos renews thumb, gaze, jump, sprint, and release beyond every finite pointer;
 * Awtsmoos.com keeps each finger in its own vessel, so a stranger touch cannot steal or end the camera's light.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { HodTouchMovementState } from "../src/player/input/touch/HodTouchMovementState.js";
import { YesodTouchMovementPad } from "../src/player/input/touch/YesodTouchMovementPad.js";
import { YesodTouchLookGateway } from "../src/player/input/touch/YesodTouchLookGateway.js";
import { YesodTouchPlayerActions } from "../src/player/input/touch/YesodTouchPlayerActions.js";

function createEventTarget() {
	const listeners = new Map();
	return {
		style: {}, attributes: new Map(),
		addEventListener(type, handler) { listeners.set(type, handler); },
		removeEventListener(type) { listeners.delete(type); },
		setPointerCapture() {}, releasePointerCapture() {},
		setAttribute(name, value) { this.attributes.set(name, value); },
		getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
		dispatch(type, event = {}) { listeners.get(type)?.({ preventDefault() {}, ...event }); }
	};
}

function touchWindow() {
	return createEventTarget();
}

test("movement pad produces forward intent and pointer cancellation returns neutral", () => {
	const state = new HodTouchMovementState();
	const pad = createEventTarget();
	const knob = createEventTarget();
	new YesodTouchMovementPad(state, pad, knob).bind();
	pad.dispatch("pointerdown", { pointerType: "touch", pointerId: 3, clientX: 50, clientY: 8 });
	assert.ok(state.view().forward > 0.9);
	pad.dispatch("pointercancel", { pointerType: "touch", pointerId: 3 });
	assert.equal(state.view().forward, 0);
	assert.equal(knob.style.transform, "translate(0, 0)");
});

test("battlefield look follows its owner globally and ignores another finger's release", () => {
	const windowAuthority = touchWindow();
	const canvas = createEventTarget();
	canvas.ownerDocument = { defaultView: windowAuthority };
	const deltas = [];
	const gateway = new YesodTouchLookGateway((x, y) => deltas.push([x, y]), canvas);
	gateway.bind();
	canvas.dispatch("pointerdown", { pointerType: "touch", pointerId: 9, clientX: 20, clientY: 30 });
	windowAuthority.dispatch("pointermove", { pointerType: "touch", pointerId: 9, clientX: 29, clientY: 24 });
	windowAuthority.dispatch("pointerup", { pointerType: "touch", pointerId: 7 });
	windowAuthority.dispatch("pointermove", { pointerType: "touch", pointerId: 9, clientX: 35, clientY: 20 });
	windowAuthority.dispatch("pointerup", { pointerType: "touch", pointerId: 9 });
	windowAuthority.dispatch("pointermove", { pointerType: "touch", pointerId: 9, clientX: 50, clientY: 50 });
	assert.deepEqual(deltas, [[9, -6], [6, -4]]);
});

test("lost pointer capture clears the active battlefield look owner", () => {
	const windowAuthority = touchWindow();
	const canvas = createEventTarget();
	canvas.ownerDocument = { defaultView: windowAuthority };
	const deltas = [];
	new YesodTouchLookGateway((x, y) => deltas.push([x, y]), canvas).bind();
	canvas.dispatch("pointerdown", { pointerType: "touch", pointerId: 4, clientX: 10, clientY: 10 });
	canvas.dispatch("lostpointercapture", { pointerType: "touch", pointerId: 4 });
	windowAuthority.dispatch("pointermove", { pointerType: "touch", pointerId: 4, clientX: 30, clientY: 30 });
	assert.deepEqual(deltas, []);
});

test("action holds release on cancellation while jump and slide remain semantic callbacks", () => {
	const state = new HodTouchMovementState();
	const elements = Object.fromEntries(["#touch-jump", "#touch-sprint", "#touch-slide"].map(key => [key, createEventTarget()]));
	const events = [];
	const actions = new YesodTouchPlayerActions(state, { onJump: () => events.push("jump"), onSlide: () => events.push("slide") }, { querySelector: selector => elements[selector] });
	actions.bind();
	elements["#touch-jump"].dispatch("pointerdown", { pointerType: "touch", pointerId: 1 });
	elements["#touch-sprint"].dispatch("pointerdown", { pointerType: "touch", pointerId: 2 });
	elements["#touch-slide"].dispatch("pointerdown", { pointerType: "touch", pointerId: 3 });
	assert.deepEqual(events, ["jump", "slide"]);
	assert.equal(state.view().sprint, true);
	assert.equal(state.view().crouch, true);
	elements["#touch-sprint"].dispatch("pointercancel", { pointerType: "touch", pointerId: 2 });
	elements["#touch-slide"].dispatch("pointercancel", { pointerType: "touch", pointerId: 3 });
	assert.equal(state.view().sprint, false);
	assert.equal(state.view().crouch, false);
});
