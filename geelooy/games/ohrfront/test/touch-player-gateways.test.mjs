//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file touch-player-gateways.test.mjs
 * @description Proves pointer movement/actions and document-capture native camera look remain simultaneous while only actual controls block acquisition.
 * The Awtsmoos renews thumb, stride, fire, and gaze while Awtsmoos.com gives each finger its truthful stream in light;
 * open screen turns the battlefield from canvas or HUD, yet every real control preserves its finite right.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { HodTouchMovementState } from "../src/player/input/touch/HodTouchMovementState.js";
import { YesodTouchMovementPad } from "../src/player/input/touch/YesodTouchMovementPad.js";
import { YesodTouchLookGateway } from "../src/player/input/touch/YesodTouchLookGateway.js";
import { YesodTouchPlayerActions } from "../src/player/input/touch/YesodTouchPlayerActions.js";
import {
	createTouchLookContact,
	createTouchLookDocument,
	createTouchLookEvent,
	createTouchLookEventFromContacts,
	createTouchLookTarget
} from "./support/TouchLookTestAuthorities.mjs";

/** Creates one document/canvas pair whose native TouchEvents reach camera look at document capture. */
function createYesodLookWitness(onLook = () => {}) {
	const { documentAuthority, windowAuthority } = createTouchLookDocument();
	const canvas = createTouchLookTarget({ tagName: "CANVAS" });
	canvas.ownerDocument = documentAuthority;
	const gateway = new YesodTouchLookGateway(onLook, canvas);
	assert.equal(gateway.bind(), true);
	return { documentAuthority, windowAuthority, canvas, gateway };
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

test("decorative HUD acquires native camera look on document capture", () => {
	const deltas = [];
	const { documentAuthority, gateway } = createYesodLookWitness((x, y) => deltas.push([x, y]));
	const overlay = createTouchLookTarget({ className: "ohr-hud-readout" });
	documentAuthority.dispatch("touchstart", createTouchLookEvent(9, overlay));
	documentAuthority.dispatch("touchmove", createTouchLookEvent(9, overlay, 31, 23));
	assert.deepEqual(deltas, [[11, -7]]);
	assert.equal(gateway.view().touchIdentifier, 9);
	assert.equal(gateway.view().acquisition.captureSurface, "document");
});

test("first blocked changed touch does not prevent a second open touch acquiring camera", () => {
	const { documentAuthority, gateway } = createYesodLookWitness();
	const fire = createTouchLookTarget({ className: "ohr-touch-fire", tagName: "BUTTON" });
	const open = createTouchLookTarget({ className: "ohr-hud-overlay" });
	documentAuthority.dispatch("touchstart", createTouchLookEventFromContacts([
		createTouchLookContact(30, fire),
		createTouchLookContact(31, open, 80, 90)
	], fire));
	assert.equal(gateway.view().touchIdentifier, 31);
});

test("owned open touch keeps rotating after crossing over a control", () => {
	const deltas = [];
	const { documentAuthority, gateway } = createYesodLookWitness((x, y) => deltas.push([x, y]));
	const open = createTouchLookTarget({ tagName: "CANVAS" });
	const fire = createTouchLookTarget({ className: "ohr-touch-fire", tagName: "BUTTON" });
	documentAuthority.dispatch("touchstart", createTouchLookEvent(44, open, 100, 100));
	documentAuthority.dispatch("touchmove", createTouchLookEvent(44, fire, 130, 115));
	assert.deepEqual(deltas, [[30, 15]]);
	assert.equal(gateway.view().touchIdentifier, 44);
});

test("owner touchcancel clears look while a stranger touchend cannot release it", () => {
	const { documentAuthority, canvas, gateway } = createYesodLookWitness();
	documentAuthority.dispatch("touchstart", createTouchLookEvent(12, canvas));
	documentAuthority.dispatch("touchend", createTouchLookEvent(77, canvas, 20, 30, false));
	assert.equal(gateway.view().touchIdentifier, 12);
	documentAuthority.dispatch("touchcancel", createTouchLookEvent(12, canvas, 20, 30, false));
	assert.equal(gateway.view().touchIdentifier, null);
});

test("pointer movement and document-native look remain simultaneous authorities", () => {
	const state = new HodTouchMovementState();
	const pad = createTouchLookTarget();
	const knob = createTouchLookTarget();
	const deltas = [];
	new YesodTouchMovementPad(state, pad, knob).bind();
	const { documentAuthority } = createYesodLookWitness((x, y) => deltas.push([x, y]));
	const battlefield = createTouchLookTarget({ className: "ohr-hud-overlay" });
	pad.dispatch("pointerdown", { pointerType: "touch", pointerId: 31, clientX: 50, clientY: 8 });
	documentAuthority.dispatch("touchstart", createTouchLookEvent(42, battlefield, 100, 120));
	documentAuthority.dispatch("touchmove", createTouchLookEvent(42, battlefield, 150, 100));
	assert.ok(state.view().forward > 0.9);
	assert.deepEqual(deltas, [[50, -20]]);
});

test("action holds release on cancellation while jump and slide remain callbacks", () => {
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
