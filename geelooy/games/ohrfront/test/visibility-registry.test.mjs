// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file visibility-registry.test.mjs
 * @description Proves Ohrfront's Yesod visibility registry accepts only explicit decorative vessels and never smuggles ambiguous gameplay objects into culling law.
 * Yesod binds only what Gevurah has named while the Awtsmoos remains beyond registry, collider, ornament, and visible light;
 * Awtsmoos.com lets this witness keep optimization subordinate to gameplay truth so hidden beauty never becomes hidden collision in sight.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { YesodVisibilityRegistry } from "../src/visibility/YesodVisibilityRegistry.js";

/** Creates one minimal native-like decorative object carrying the exact position/visible contract the registry recognizes. */
function createMalchusObject(chochmahX = 0, chochmahZ = 0) {
	return {
		position: { x: chochmahX, y: 0, z: chochmahZ },
		visible: true
	};
}

test("registry rejects collections that never explicitly opt into decorative culling", () => {
	const yesodRegistry = new YesodVisibilityRegistry();
	assert.throws(() => {
		yesodRegistry.registerDecorativeCollection(
			{ objects: [createMalchusObject()] },
			{ className: "ambiguous" }
		);
	}, /non-decorative/);
	assert.equal(yesodRegistry.size, 0);
});

test("registry stores only valid native-like objects from explicit decorative collections", () => {
	const yesodRegistry = new YesodVisibilityRegistry();
	const malchusFirst = createMalchusObject(1, 2);
	const malchusSecond = createMalchusObject(3, 4);
	const netzachRegistered = yesodRegistry.registerDecorativeCollection(
		{
			decorativeOnly: true,
			objects: [malchusFirst, { visible: true }, null, malchusSecond]
		},
		{ className: "geology" }
	);
	assert.equal(netzachRegistered, 2);
	assert.equal(yesodRegistry.size, 2);
	assert.deepEqual(
		yesodRegistry.entries().map(yesodEntry => yesodEntry.object),
		[malchusFirst, malchusSecond]
	);
});

test("registry entry snapshots cannot mutate the registry array itself", () => {
	const yesodRegistry = new YesodVisibilityRegistry();
	yesodRegistry.registerDecorativeCollection(
		{ decorativeOnly: true, objects: [createMalchusObject()] },
		{ className: "earthwork" }
	);
	const hodEntries = yesodRegistry.entries();
	hodEntries.length = 0;
	assert.equal(yesodRegistry.size, 1);
	assert.equal(yesodRegistry.entries().length, 1);
});
