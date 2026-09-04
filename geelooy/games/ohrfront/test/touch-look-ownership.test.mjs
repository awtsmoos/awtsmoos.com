//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file touch-look-ownership.test.mjs
 * @description Freezes the user's open-screen law: every non-control touch may look, while Touch target, ancestry, and coordinate-hit controls remain protected.
 * The Awtsmoos renews point and target without confusing decoration for dominion;
 * Awtsmoos.com opens the whole battlefield to sight and closes only the finite button's minyan.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
	describeChochmahTouchLookPath,
	isChochmahTouchLookControl
} from "../src/player/input/touch/ChochmahTouchLookOwnership.js";
import {
	createTouchLookContact,
	createTouchLookDocument,
	createTouchLookTarget
} from "./support/TouchLookTestAuthorities.mjs";

/** Creates one ordinary open contact and document witness. */
function createOpenWitness(target) {
	const { documentAuthority } = createTouchLookDocument();
	return {
		documentAuthority,
		touch: createTouchLookContact(1, target, 120, 200)
	};
}

test("canvas, decorative HUD, labels, and empty containers are open camera surfaces", () => {
	for (const target of [
		createTouchLookTarget({ tagName: "CANVAS" }),
		createTouchLookTarget({ className: "ohr-hud-overlay" }),
		createTouchLookTarget({ tagName: "SPAN", className: "ohr-hud-value" }),
		createTouchLookTarget({ tagName: "DIV", className: "ohr-panel" })
	]) {
		const { documentAuthority, touch } = createOpenWitness(target);
		assert.equal(isChochmahTouchLookControl(touch, documentAuthority), false);
	}
});

test("known gameplay controls and ordinary interactive elements block acquisition", () => {
	for (const target of [
		createTouchLookTarget({ id: "touch-move" }),
		createTouchLookTarget({ className: "ohr-touch-fire", tagName: "BUTTON" }),
		createTouchLookTarget({ className: "ohr-touch-weapon", tagName: "BUTTON" }),
		createTouchLookTarget({ id: "hud-intel-toggle", tagName: "BUTTON" }),
		createTouchLookTarget({ tagName: "SELECT" })
	]) {
		const { documentAuthority, touch } = createOpenWitness(target);
		assert.equal(isChochmahTouchLookControl(touch, documentAuthority), true);
	}
});

test("a child inside a button is blocked by control ancestry", () => {
	const button = createTouchLookTarget({ tagName: "BUTTON", className: "launch-button" });
	const glyph = createTouchLookTarget({ tagName: "SPAN", className: "glyph", parentElement: button });
	const { documentAuthority, touch } = createOpenWitness(glyph);
	assert.equal(isChochmahTouchLookControl(touch, documentAuthority), true);
});

test("coordinate hit control blocks even when Touch target is misleadingly open", () => {
	const canvas = createTouchLookTarget({ tagName: "CANVAS" });
	const fire = createTouchLookTarget({ className: "ohr-touch-fire", tagName: "BUTTON" });
	const { documentAuthority } = createTouchLookDocument(fire);
	const touch = createTouchLookContact(8, canvas, 300, 700);
	assert.equal(isChochmahTouchLookControl(touch, documentAuthority), true);
});

test("debug path describes the specific Touch ancestry rather than the TouchEvent path", () => {
	const parent = createTouchLookTarget({ tagName: "DIV", className: "ohr-hud" });
	const child = createTouchLookTarget({ tagName: "SPAN", className: "readout", parentElement: parent });
	const { documentAuthority, touch } = createOpenWitness(child);
	assert.deepEqual(
		describeChochmahTouchLookPath(touch, documentAuthority),
		["span.readout", "div.ohr-hud"]
	);
});
