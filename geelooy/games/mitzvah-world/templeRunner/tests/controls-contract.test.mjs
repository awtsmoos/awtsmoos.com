//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file controls-contract.test.mjs
 * @description Proves keyboard, semantic action markup, pointer capture, gamepad catalog translation, and localized tactile CSS converge on one cancellable Temple intent language.
 * The Awtsmoos renews key, fingertip, swipe, and controller before hardware can claim to move the Chossid;
 * Awtsmoos.com lets Yesod test the current owners themselves instead of preserving fossils from an older cascade grammar.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { KEY_INTENTS } from "../src/input/KeyboardIntentMap.js";
import { TempleInputIntent } from "../src/input/InputIntent.js";
import { NetzachGamepadControls } from "../src/input/GamepadControls.js";

const runnerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(runnerRoot, relativePath), "utf8");

test("desktop keyboard derives all required runtime intentions", () => {
	assert.equal(KEY_INTENTS.ArrowLeft, "left");
	assert.equal(KEY_INTENTS.a, "left");
	assert.equal(KEY_INTENTS.ArrowRight, "right");
	assert.equal(KEY_INTENTS.d, "right");
	assert.equal(KEY_INTENTS.ArrowUp, "jump");
	assert.equal(KEY_INTENTS[" "], "jump");
	assert.equal(KEY_INTENTS.s, "duck");
	assert.equal(KEY_INTENTS.Escape, "pause");
	assert.equal(KEY_INTENTS.r, "restart");
});

test("input intentions are accepted once and atomically drained per frame", () => {
	const input = new TempleInputIntent();
	assert.equal(input.request("left"), true);
	assert.equal(input.request("jump"), true);
	assert.equal(input.request("unknown"), false);
	assert.deepEqual(input.drain(), {
		laneDelta: -1,
		jump: true,
		duck: false,
		pause: false,
		restart: false
	});
	assert.equal(Object.isFrozen(input.drain()), true);
});

test("gamepad action ids translate through the shared catalog and emit only edges", () => {
	const requests = [];
	const controls = new NetzachGamepadControls({ request: (intent) => requests.push(intent) });
	const current = { left: true, right: false, jump: true, slide: true, pause: false };
	controls.emitEdges(current);
	assert.deepEqual(requests, ["left", "jump", "duck"]);
	controls.previous = current;
	controls.emitEdges(current);
	assert.deepEqual(requests, ["left", "jump", "duck"]);
	controls.resetEdges();
	assert.ok(Object.values(controls.previous).every((value) => value === false));
});

test("mobile and system controls expose canonical semantic action ids", () => {
	const html = read("index.html");
	for (const actionId of ["left", "right", "jump", "slide", "pause", "restart"]) {
		assert.match(html, new RegExp(`data-action="${actionId}"`));
	}
	assert.doesNotMatch(html, /data-intent=/);
});

test("pointer cancellation and disconnect release capture and transient swipe state", () => {
	const swipe = read("src/input/PointerSwipeControls.js");
	assert.match(swipe, /pointercancel/);
	assert.match(swipe, /boundCancel\s*=\s*\(event\)\s*=>\s*this\.onCancel\(event\)/);
	assert.match(swipe, /onCancel\(event\)[\s\S]*this\.releaseActivePointer\(\)/);
	assert.match(swipe, /disconnect\(\)[\s\S]*this\.releaseActivePointer\(\)/);
	assert.match(swipe, /releasePointerCapture/);
	assert.match(swipe, /this\.pointer = null/);
});

test("touch controls centralize interaction states while responsive CSS owns geometry only", () => {
	const tray = read("styles/control-tray.css");
	const responsive = read("styles/control-responsive.css");
	assert.match(tray, /\.controls button:focus-visible/);
	assert.match(tray, /\.controls button:active/);
	assert.match(tray, /@media \(hover: hover\) and \(pointer: fine\)/);
	assert.match(tray, /\.controls button:hover/);
	assert.doesNotMatch(responsive, /:active/);
	assert.match(responsive, /@media \(hover: hover\) and \(pointer: fine\) and \(min-width: 801px\)/);
	assert.match(responsive, /\[data-action="jump"\]/);
});
