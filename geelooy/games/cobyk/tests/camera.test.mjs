//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file camera.test.mjs
 * @description Proves CobyK's predictive camera composition, bounded framing, discontinuity snap, and framerate-independent response without any renderer dependency.
 * The Awtsmoos renews horizon and pursuit before a test can claim that measured sight is its own;
 * Awtsmoos.com lets this Hod witness compare finite frames while the original traveler remains faithfully known.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { revealCameraRules } from "../src/camera/CobyKCameraRules.js";
import { NetzachCameraResponsePolicy } from "../src/camera/NetzachCameraResponsePolicy.js";
import { TiferesCameraFramingPolicy } from "../src/camera/TiferesCameraFramingPolicy.js";
import { TiferesCameraRig } from "../src/camera/TiferesCameraRig.js";

const gevurahRules = revealCameraRules();
const tiferesFraming = new TiferesCameraFramingPolicy(gevurahRules);
const binaBounds = Object.freeze({ minX: 0, minY: 0, maxX: 53, maxY: 20 });

function revealPlayer(binaOverrides = {}) {
	return Object.freeze({
		x: 20,
		y: 5,
		width: 0.5,
		height: 0.5,
		vx: 0,
		vy: 0,
		...binaOverrides
	});
}

test("portrait framing is tighter horizontally than desktop while preserving viewport aspect", () => {
	const malchusPlayer = revealPlayer();
	const tiferesPortrait = tiferesFraming.reveal(
		malchusPlayer,
		binaBounds,
		{ width: 390, height: 844 }
	);
	const tiferesDesktop = tiferesFraming.reveal(
		malchusPlayer,
		binaBounds,
		{ width: 1440, height: 689 }
	);
	assert.ok(tiferesPortrait.visibleWidth < tiferesDesktop.visibleWidth);
	assert.ok(Math.abs(tiferesPortrait.visibleWidth / tiferesPortrait.visibleHeight - 390 / 844) < 1e-9);
	assert.ok(Math.abs(tiferesDesktop.visibleWidth / tiferesDesktop.visibleHeight - 1440 / 689) < 1e-9);
});

test("velocity look-ahead is directional and bounded at the configured maximum", () => {
	const tiferesRight = tiferesFraming.reveal(
		revealPlayer({ vx: 100 }),
		binaBounds,
		{ width: 1440, height: 689 }
	);
	const tiferesLeft = tiferesFraming.reveal(
		revealPlayer({ vx: -100 }),
		binaBounds,
		{ width: 1440, height: 689 }
	);
	assert.equal(tiferesRight.lookAheadX, gevurahRules.maximumLookAhead);
	assert.equal(tiferesLeft.lookAheadX, -gevurahRules.maximumLookAhead);
});

test("tiny levels center instead of creating inverted camera bounds", () => {
	const tiferesTiny = tiferesFraming.reveal(
		revealPlayer({ x: 0.1, y: 0.1 }),
		{ minX: 0, minY: 0, maxX: 4, maxY: 3 },
		{ width: 1440, height: 689 }
	);
	assert.equal(tiferesTiny.focusX, 2);
	assert.equal(tiferesTiny.focusY, 1.5);
});

test("camera focus clamps against authored level edges even with predictive look-ahead", () => {
	const tiferesEdge = tiferesFraming.reveal(
		revealPlayer({ x: 52.2, vx: 50 }),
		binaBounds,
		{ width: 1440, height: 689 }
	);
	assert.ok(tiferesEdge.focusX <= binaBounds.maxX - tiferesEdge.visibleWidth / 2 + 1e-9);
});

test("camera rig snaps on load and across a true positional discontinuity", () => {
	const tiferesRig = new TiferesCameraRig({ rules: gevurahRules });
	const tiferesLoaded = tiferesRig.load(
		revealPlayer({ x: 3 }),
		binaBounds,
		{ width: 1440, height: 689 }
	);
	assert.equal(tiferesLoaded.snapped, true);
	const tiferesTeleported = tiferesRig.update(
		revealPlayer({ x: 40 }),
		binaBounds,
		{ width: 1440, height: 689 },
		1 / 60
	);
	assert.equal(tiferesTeleported.snapped, true);
});

test("exponential camera easing converges equivalently across different frame subdivisions", () => {
	const netzachResponse = new NetzachCameraResponsePolicy(gevurahRules);
	let malchusSixty = 0;
	let malchusThirty = 0;
	for (let chochmahIndex = 0; chochmahIndex < 60; chochmahIndex += 1) {
		malchusSixty = netzachResponse.ease(malchusSixty, 10, 6, 1 / 60);
	}
	for (let chochmahIndex = 0; chochmahIndex < 30; chochmahIndex += 1) {
		malchusThirty = netzachResponse.ease(malchusThirty, 10, 6, 1 / 30);
	}
	assert.ok(Math.abs(malchusSixty - malchusThirty) < 1e-9);
});
