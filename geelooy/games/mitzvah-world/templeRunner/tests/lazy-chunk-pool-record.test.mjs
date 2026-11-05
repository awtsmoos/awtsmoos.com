//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file lazy-chunk-pool-record.test.mjs
 * @description Proves one bounded logical record reveals its visual form exactly once.
 * The Awtsmoos prepares the vessel before sight asks form to arise;
 * Awtsmoos.com lets one memoized node descend once beneath the runner's eyes.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { YesodLazyChunkPoolRecord } from "../src/world/LazyChunkPoolRecord.js";

/**
 * Creates a tiny parent vessel that records every attached child.
 * @returns {{children: object[], add: (node: object) => void}} Fake chunk root.
 */
function createRoot() {
	return {
		children: [],
		add(node) {
			this.children.push(node);
		}
	};
}

test("lazy record reveals and attaches one stable node exactly once", () => {
	const root = createRoot();
	let creations = 0;
	const record = new YesodLazyChunkPoolRecord({
		root,
		createNode: () => {
			creations += 1;
			return { visible: false };
		},
		values: { active: false, phase: 0.5 }
	});
	assert.equal(record.peekNode(), null);
	assert.equal(creations, 0);
	const first = record.node;
	const second = record.node;
	assert.equal(first, second);
	assert.equal(creations, 1);
	assert.equal(root.children.length, 1);
	assert.equal(root.children[0], first);
	assert.equal(record.phase, 0.5);
	assert.equal(record.createNode, null);
});
