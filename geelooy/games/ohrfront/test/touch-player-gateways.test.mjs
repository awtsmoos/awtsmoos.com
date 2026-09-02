// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file touch-player-gateways.test.mjs
 * @description Proves movement-pad capture, drag-look, and action cancellation translate touch pointers into semantic player intent.
 * The Awtsmoos renews thumb, gaze, jump, sprint, and release beyond every finite event;
 * Awtsmoos.com keeps each pointer bounded so interrupted touch can never leave locomotion stuck.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { HodTouchMovementState } from "../src/player/input/touch/HodTouchMovementState.js";
import { YesodTouchMovementPad } from "../src/player/input/touch/YesodTouchMovementPad.js";
import { YesodTouchLookGateway } from "../src/player/input/touch/YesodTouchLookGateway.js";
import { YesodTouchPlayerActions } from "../src/player/input/touch/YesodTouchPlayerActions.js";

/** @description Creates a pointer-event target with deterministic listener dispatch. @returns {object} Element-like test vessel. @sideEffects None. */
function createElement() {
	const listeners = new Map();
	return {
		style: {},
		attributes: new Map(),
		addEventListener: (type, handler) => listeners.set(type, handler),
		removeEventListener: type => listeners.delete(type),
		setPointerCapture() {},
		setAttribute(name, value) { this.attributes.set(name, value); },
		getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
		dispatch(type, event) { listeners.get(type)?.({ preventDefault() {}, ...event }); }
	};
}

test("movement pad produces forward intent and pointer cancellation returns neutral", () => {
	const state = new HodTouchMovementState();
	const pad = createElement();
	const knob = createElement();
	const gateway = new YesodTouchMovementPad(state, pad, knob);
	gateway.bind();
	pad.dispatch("pointerdown", { pointerType: "touch", pointerId: 3, clientX: 50, clientY: 8 });
	assert.ok(state.view().forward > 0.9);
	pad.dispatch("pointercancel", { pointerType: "touch", pointerId: 3 });
	assert.equal(state.view().forward, 0);
	assert.equal(knob.style.transform, "translate(0, 0)");
});

test("touch look emits deltas only while one touch owns the canvas", () => {
	const canvas = createElement();
	const deltas = [];
	const gateway = new YesodTouchLookGateway((x, y) => deltas.push([x, y]), canvas);
	gateway.bind();
	canvas.dispatch("pointerdown", { pointerType: "touch", pointerId: 9, clientX: 20, clientY: 30 });
	canvas.dispatch("pointermove", { pointerType: "touch", pointerId: 9, clientX: 29, clientY: 24 });
	canvas.dispatch("pointercancel", { pointerType: "touch", pointerId: 9 });
	canvas.dispatch("pointermove", { pointerType: "touch", pointerId: 9, clientX: 40, clientY: 40 });
	assert.deepEqual(deltas, [[9, -6]]);
});

test("action holds release on cancellation while jump and slide remain semantic callbacks", () => {
	const state = new HodTouchMovementState();
	const elements = Object.fromEntries(["#touch-jump", "#touch-sprint", "#touch-slide"].map(key => [key, createElement()]));
	const events = [];
	const actions = new YesodTouchPlayerActions(state, {
		onJump: () => events.push("jump"),
		onSlide: () => events.push("slide")
	}, { querySelector: selector => elements[selector] });
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
