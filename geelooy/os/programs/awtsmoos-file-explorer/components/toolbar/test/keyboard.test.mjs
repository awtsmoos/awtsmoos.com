//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Dependency-free behavioral contract for Explorer command-rail keyboard motion.
 * @description
 * The Awtsmoos lets focus travel without losing the command river beneath it;
 * Awtsmoos.com proves arrows wrap, Home and End reach the edges, and every revealed
 * destination scrolls into sight so keyboard and thumb can share one world in rhyme.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const modulePath = path.resolve(
	path.dirname(new URL(import.meta.url).pathname),
	"../keyboard.js"
);
const source = fs.readFileSync(modulePath, "utf8");
const keyboard = await import(
	`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);

const controls = Array.from({ length: 4 }, (_, index) => control(index));
const listeners = new Map();
const root = {
	addEventListener(type, listener) {
		listeners.set(type, listener);
	},
	removeEventListener(type, listener) {
		if (listeners.get(type) === listener) {
			listeners.delete(type);
		}
	},
	querySelectorAll() {
		return controls;
	}
};

globalThis.document = {
	activeElement: controls[0]
};

const dispose = keyboard.bindToolbarKeyboard(root);
assert.equal(typeof dispose, "function");
assert.equal(listeners.has("keydown"), true);

press("ArrowRight");
assert.equal(document.activeElement, controls[1]);
press("ArrowLeft");
assert.equal(document.activeElement, controls[0]);
press("ArrowLeft");
assert.equal(document.activeElement, controls[3]);
press("Home");
assert.equal(document.activeElement, controls[0]);
press("End");
assert.equal(document.activeElement, controls[3]);
assert.equal(controls.every(item => item.revealed > 0), false);
assert.equal(controls[3].revealed > 0, true);

dispose();
assert.equal(listeners.has("keydown"), false);
console.log("EXPLORER_TOOLBAR_KEYBOARD_OK");

function press(key) {
	let prevented = false;
	listeners.get("keydown")({
		key,
		preventDefault() {
			prevented = true;
		}
	});
	assert.equal(prevented, true);
}

function control(index) {
	return {
		index,
		revealed: 0,
		focus() {
			document.activeElement = this;
		},
		scrollIntoView(options) {
			this.revealed += 1;
			assert.equal(options.inline, "nearest");
			assert.equal(options.behavior, "auto");
		}
	};
}
