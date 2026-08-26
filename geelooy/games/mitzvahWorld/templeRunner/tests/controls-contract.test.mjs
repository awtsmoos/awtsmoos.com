// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Yesod control regression proving keyboard, touch, swipe, and gamepad vessels converge on one discrete frame-intent language.
 * The Awtsmoos renews key, fingertip, swipe, and controller before any hardware can claim to move the Chossid;
 * Awtsmoos.com lets Yesod prove every control is tactile, cancellable, and shared between mobile and desktop without hidden held-state debt.
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
const read = relative => fs.readFileSync(path.join(runnerRoot, relative), "utf8");

test("desktop keyboard maps movement, jump, slide, pause, and restart", () => {
	assert.equal(KEY_INTENTS.ArrowLeft, "left");
	assert.equal(KEY_INTENTS.a, "left");
	assert.equal(KEY_INTENTS.ArrowRight, "right");
	assert.equal(KEY_INTENTS.d, "right");
	assert.equal(KEY_INTENTS.ArrowUp, "jump");
	assert.equal(KEY_INTENTS[" "], "jump");
	assert.equal(KEY_INTENTS.s, "duck");
	assert.equal(KEY_INTENTS.Escape, "pause");
	assert.equal(KEY_INTENTS.r, "restart");
	assert.equal(KEY_INTENTS.Enter, "restart");
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
	assert.deepEqual(input.drain(), {
		laneDelta: 0,
		jump: false,
		duck: false,
		pause: false,
		restart: false
	});
});

test("gamepad controls emit only rising edges and reset cleanly", () => {
	const requests = [];
	const controls = new NetzachGamepadControls({
		request(intent) {
			requests.push(intent);
		}
	});
	const current = {
		left: true,
		right: false,
		jump: true,
		duck: false,
		pause: false
	};
	controls.emitEdges(current);
	assert.deepEqual(requests, ["left", "jump"]);
	controls.previous = current;
	controls.emitEdges(current);
	assert.deepEqual(requests, ["left", "jump"]);
	controls.resetEdges();
	assert.ok(Object.values(controls.previous).every(value => value === false));
});

test("mobile and game actions expose every required explicit intent", () => {
	const html = read("index.html");
	for (const intent of ["left", "right", "jump", "duck", "pause", "restart"]) {
		assert.match(html, new RegExp(`data-intent="${intent}"`));
	}
});

test("pointer cancellation and detach paths clear transient swipe state", () => {
	const swipe = read("src/input/PointerSwipeControls.js");
	assert.match(swipe, /pointercancel/);
	assert.match(swipe, /boundCancel\s*=\s*\(\)\s*=>\s*this\.clear\(\)/);
	assert.match(swipe, /disconnect\(\)[\s\S]*this\.clear\(\)/);
});

test("touch controls expose focus, active, and pointer-gated hover feedback", () => {
	const tray = read("styles/control-tray.css");
	const responsive = read("styles/control-responsive.css");
	assert.match(tray, /\.controls button:focus-visible/);
	assert.match(tray, /\.controls button:active/);
	assert.match(responsive, /@media \(hover: hover\) and \(pointer: fine\)/);
	assert.match(responsive, /\.controls button:hover/);
});
