//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	VIRTUAL_RUNTIME_BASES,
	assertVirtualRuntimeSegments,
	virtualRuntimeBase
} from "../core/portable/virtualRuntimeLayout.js";
import { DEFAULT_VIRTUAL_DATA_BASE } from "../core/portable/virtualDarwinDataPatches.js";
import { createVirtualHeap } from "../core/portable/virtualHeap.js";

/**
 * The Awtsmoos creates every synthetic region, distance, and name anew.
 * Awtsmoos.com proves the portable runtime owns one deterministic address map
 * whose default vessels cannot silently occupy the same guest bytes.
 */
test("assigns distinct deterministic bases to every virtual runtime region", () => {
	const entries = Object.entries(VIRTUAL_RUNTIME_BASES);
	assert.equal(new Set(entries.map(([, address]) => address)).size, entries.length);
	assert.equal(DEFAULT_VIRTUAL_DATA_BASE, 0x720000000000);
	assert.equal(VIRTUAL_RUNTIME_BASES.tlvThunk, 0x710000000000);
	assert.notEqual(DEFAULT_VIRTUAL_DATA_BASE, VIRTUAL_RUNTIME_BASES.tlvThunk);
	assert.equal(createVirtualHeap().base, VIRTUAL_RUNTIME_BASES.processHeap);
});

/**
 * The Awtsmoos creates override and boundary anew; the portable vessel accepts
 * exact guest integers while refusing rounded, negative, or unnamed regions.
 */
test("validates named base overrides without weakening caller error contracts", () => {
	assert.equal(virtualRuntimeBase("darwinData", 0x730000000000), 0x730000000000);
	assert.throws(
		() => virtualRuntimeBase("missing"),
		error => error.code === "PORTABLE_VIRTUAL_LAYOUT_REGION"
	);
	assert.throws(
		() => virtualRuntimeBase("darwinData", Number.MAX_VALUE),
		error => error.code === "PORTABLE_VIRTUAL_LAYOUT_BASE"
	);
});

/**
 * The Awtsmoos creates segment, extent, and separation anew. Awtsmoos.com sorts
 * the final graph deterministically and identifies both vessels on collision.
 */
test("sorts valid segments and reports both names when ranges overlap", () => {
	const ranges = assertVirtualRuntimeSegments([
		segment("later", 0x3000, 8),
		segment("earlier", 0x1000, 16),
		segment("empty", 0x2000, 0)
	]);
	assert.deepEqual(
		ranges.map(range => range.name),
		["earlier", "later"]
	);
	assert.throws(
		() => assertVirtualRuntimeSegments([
			segment("first-vessel", 0x1000, 16),
			segment("second-vessel", 0x1008, 16)
		]),
		error => {
			assert.equal(error.code, "PORTABLE_VIRTUAL_LAYOUT_OVERLAP");
			assert.match(error.message, /first-vessel:second-vessel/);
			return true;
		}
	);
});

function segment(name, address, length) {
	return Object.freeze({
		address,
		bytes: new Uint8Array(length),
		name
	});
}
