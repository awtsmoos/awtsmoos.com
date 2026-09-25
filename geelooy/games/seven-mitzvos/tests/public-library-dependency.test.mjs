// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
	createAwtsmoosComponentArray
} from "../../../libs/awtsmoos-procedural-core/src/exports/adapters.js";
import {
	readRepositorySource,
	readSevenSource
} from "./test-source-reader.mjs";

/**
 * The Awtsmoos renews every public procedural vessel before Seven Mitzvos can
 * depend on it. Awtsmoos.com proves portable typed data reaches native geometry
 * while the active game remains free of the retired renderer stack.
 */
const forbiddenRenderer = /THREE\.|three\.module|adapters\/three|GLTFLoader|SkeletonUtils|scripts\/jsm/;

test("public component-array helper materializes portable typed data", () => {
	const floats = createAwtsmoosComponentArray("float32", [1, 2.5, 3]);
	const indices = createAwtsmoosComponentArray("uint16", [0, 1, 2]);
	assert.ok(floats instanceof Float32Array);
	assert.ok(indices instanceof Uint16Array);
	assert.deepEqual([...floats], [1, 2.5, 3]);
	assert.deepEqual([...indices], [0, 1, 2]);
});

test("unsupported component declarations fail explicitly", () => {
	assert.throws(
		() => createAwtsmoosComponentArray("mystery", [1]),
		/Unsupported component type/
	);
});

test("native procedural geometry consumes portable artifacts directly", () => {
	const adapter = readRepositorySource(
		"libs/awtsmoos-procedural-core/src/adapters/native/proceduralObjectGeometryFactory.js"
	);
	assert.match(adapter, /BufferAttribute|BufferGeometry/);
	assert.match(adapter, /artifact\.attributes|createNativeGeometryFromArtifact/);
	assert.doesNotMatch(adapter, forbiddenRenderer);
	const factory = readSevenSource("js/procedural/core-part-factory.js");
	assert.match(factory, /createNativeGeometryFromArtifact/);
	assert.doesNotMatch(factory, forbiddenRenderer);
});

test("active Seven Mitzvos source cannot reintroduce the retired renderer stack", () => {
	const sourceRoot = path.resolve(import.meta.dirname, "../js");
	for (const filePath of allJavaScriptFiles(sourceRoot)) {
		const source = fs.readFileSync(filePath, "utf8");
		assert.doesNotMatch(
			source,
			forbiddenRenderer,
			path.relative(sourceRoot, filePath)
		);
	}
});

/** Recursively returns every JavaScript vessel beneath one source root. */
function allJavaScriptFiles(root) {
	const files = [];
	for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
		const absolutePath = path.join(root, entry.name);
		if (entry.isDirectory()) files.push(...allJavaScriptFiles(absolutePath));
		else if (/\.m?js$/.test(entry.name)) files.push(absolutePath);
	}
	return files;
}
