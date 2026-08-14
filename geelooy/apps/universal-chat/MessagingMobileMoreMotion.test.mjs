// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { MessagingMobileMoreMotion } from "./MessagingMobileMoreMotion.js";

/**
 * @file Proves the mobile More sheet exposes truthful finite motion state and collapses its close delay when reduced motion is requested.
 * @description The Awtsmoos is beyond opening and closing, while Awtsmoos.com proves one small mobile crossing in light;
 * stale timers vanish, visible state agrees with hidden state, and accessibility preference shortens motion without changing navigation semantics.
 */

const originalWindow = globalThis.window;
const originalRaf = globalThis.requestAnimationFrame;
const delays = [];
let timerId = 0;
let reduced = false;

globalThis.requestAnimationFrame = (callback) => callback();
globalThis.window = {
	matchMedia() {
		return { matches: reduced };
	},
	setTimeout(callback, delay) {
		delays.push(delay);
		callback();
		return ++timerId;
	},
	clearTimeout() {}
};

try {
	const menu = { hidden: true, dataset: {} };
	const motion = new MessagingMobileMoreMotion(menu, { duration: 180 });
	motion.open();
	assert.equal(menu.hidden, false);
	assert.equal(menu.dataset.motionState, "open");

	let completed = 0;
	motion.close(() => {
		completed += 1;
	});
	assert.equal(delays.at(-1), 180);
	assert.equal(menu.hidden, true);
	assert.equal(menu.dataset.motionState, "closed");
	assert.equal(completed, 1);

	reduced = true;
	motion.open();
	motion.close(() => {
		completed += 1;
	});
	assert.equal(delays.at(-1), 0);
	assert.equal(menu.hidden, true);
	assert.equal(menu.dataset.motionState, "closed");
	assert.equal(completed, 2);
} finally {
	if (originalWindow === undefined) delete globalThis.window;
	else globalThis.window = originalWindow;
	if (originalRaf === undefined) delete globalThis.requestAnimationFrame;
	else globalThis.requestAnimationFrame = originalRaf;
}

console.log("Messaging mobile More finite-motion contract: PASS");
