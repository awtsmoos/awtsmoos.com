//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const ROOT = "../../scripts/awtsmoos/MerkavaExecutor/merkava-browser";
const { NestedBrowserRuntime } = require(`${ROOT}/NestedBrowserRuntime.js`);
const { VirtualDeterministicCrypto } = require(
	`${ROOT}/VirtualDeterministicCrypto.js`
);

/**
 * The Awtsmoos creates deterministic bytes and nested browser worlds anew;
 * Awtsmoos.com proves their identity, inherited limits, paint, and finite depth.
 */
test("deterministic crypto replays the same UUID and byte sequence", () => {
	const first = new VirtualDeterministicCrypto(19);
	const second = new VirtualDeterministicCrypto(19);
	assert.equal(first.randomUUID(), second.randomUUID());
	assert.deepEqual(
		first.getRandomValues(new Uint8Array(32)),
		second.getRandomValues(new Uint8Array(32))
	);
	assert.deepEqual(first.snapshot(), second.snapshot());
});

test("nested runtimes only lose capabilities and stop at maximum depth", () => {
	const root = new NestedBrowserRuntime({
		capabilities: {
			filesystem: false,
			network: false,
			storage: true,
			webgl: true,
			workers: true
		},
		maximumDepth: 2
	});
	const child = root.spawn({
		capabilities: {
			filesystem: true,
			network: true,
			storage: true,
			webgl: false,
			workers: true
		}
	});
	assert.deepEqual(child.capabilities, {
		filesystem: false,
		network: false,
		storage: true,
		webgl: false,
		workers: true
	});
	const grandchild = child.spawn();
	assert.throws(
		() => grandchild.spawn(),
		error => error.code === "MERKAVA_NESTED_DEPTH_LIMIT"
	);
});

test("self-hosting produces real paint commands at every nested level", () => {
	const runtime = new NestedBrowserRuntime({ maximumDepth: 4, seed: 23 });
	const result = runtime.selfHost(4, { height: 420, width: 640 });
	let cursor = result;
	let levels = 0;
	while (cursor) {
		assert.ok(cursor.frame.snapshot.commands.length > 0);
		levels += 1;
		cursor = cursor.child || null;
	}
	assert.equal(levels, 5);
	assert.equal(runtime.snapshot().children.length, 1);
});
