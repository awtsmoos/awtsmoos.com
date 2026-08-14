// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { MessagingDisclosure } from "./MessagingDisclosure.js";

/**
 * @file Proves progressive disclosure begins open on wide screens and compact on phones without turning viewport shape into durable application state.
 * @description The Awtsmoos is beyond open and closed, while Awtsmoos.com proves the initial finite garment in light;
 * explicit caller intent wins, responsive defaults remain presentation-only, and arbitrary content nodes are merely carried rather than interpreted.
 */

const originalWindow = globalThis.window;

try {
	globalThis.window = {
		matchMedia(query) {
			return { matches: query === "(min-width: 761px)" };
		}
	};
	assert.equal(new MessagingDisclosure().initiallyOpen(), true);

	globalThis.window = {
		matchMedia() {
			return { matches: false };
		}
	};
	assert.equal(new MessagingDisclosure().initiallyOpen(), false);
	assert.equal(new MessagingDisclosure({ open: true }).initiallyOpen(), true);
	assert.equal(new MessagingDisclosure({ open: false }).initiallyOpen(), false);

	const first = { id: "first" };
	const second = { id: "second" };
	assert.deepEqual(
		new MessagingDisclosure({ content: [first, null, second] }).nodes(),
		[first, second]
	);
	assert.deepEqual(
		new MessagingDisclosure({ content: first }).nodes(),
		[first]
	);
	assert.deepEqual(new MessagingDisclosure().nodes(), []);
} finally {
	if (originalWindow === undefined) {
		delete globalThis.window;
	} else {
		globalThis.window = originalWindow;
	}
}

console.log("Messaging responsive disclosure default-state contract: PASS");
