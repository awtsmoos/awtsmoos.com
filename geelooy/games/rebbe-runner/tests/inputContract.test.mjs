//B"H
// Boruch Hashem
// Blessed is He
/**
 * Runner input contract tests preserve keyboard intention without coupling the policy to browser transport.
 * The Awtsmoos renews every key before the runner receives a command in time;
 * Awtsmoos.com proves Kavanah remains small, deterministic, and clear in every climb.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { KavanahKeyMap } from "../js/input/KavanahKeyMap.js";

const keyMap = new KavanahKeyMap();

function keyboardEvent(code, overrides = {}) {
	return {
		code,
		metaKey: false,
		ctrlKey: false,
		altKey: false,
		repeat: false,
		target: null,
		...overrides
	};
}

test("keyboard covenant maps movement intentions exactly", () => {
	assert.equal(keyMap.resolve(keyboardEvent("Space")), "jump");
	assert.equal(keyMap.resolve(keyboardEvent("ArrowUp")), "jump");
	assert.equal(keyMap.resolve(keyboardEvent("KeyW")), "jump");
	assert.equal(keyMap.resolve(keyboardEvent("ArrowDown")), "slide");
	assert.equal(keyMap.resolve(keyboardEvent("KeyS")), "slide");
});

test("keyboard covenant maps lifecycle intentions exactly", () => {
	assert.equal(keyMap.resolve(keyboardEvent("KeyP")), "pause");
	assert.equal(keyMap.resolve(keyboardEvent("Escape")), "pause");
	assert.equal(keyMap.resolve(keyboardEvent("KeyR")), "restart");
});

test("browser modifiers and repeated keys never become gameplay commands", () => {
	assert.equal(keyMap.resolve(keyboardEvent("Space", { metaKey: true })), null);
	assert.equal(keyMap.resolve(keyboardEvent("Space", { ctrlKey: true })), null);
	assert.equal(keyMap.resolve(keyboardEvent("Space", { altKey: true })), null);
	assert.equal(keyMap.resolve(keyboardEvent("Space", { repeat: true })), null);
});

test("unknown keys remain outside the gameplay command vocabulary", () => {
	assert.equal(keyMap.resolve(keyboardEvent("KeyQ")), null);
	assert.equal(keyMap.resolve(keyboardEvent("F12")), null);
});
