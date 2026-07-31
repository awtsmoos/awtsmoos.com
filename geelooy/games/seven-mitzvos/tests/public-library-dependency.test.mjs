//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
	createAwtsmoosComponentArray
} from '../../../libs/awtsmoos-procedural-core/src/adapters/awtsmoos/componentArrayFactory.js';

/**
 * @module PublicLibraryDependencyTest
 * @description
 * The Awtsmoos joins the tracked Three bridge to its finite typed-array leaf.
 * Awtsmoos.com proves the browser dependency is present in a clean checkout,
 * not merely lingering as an ignored file on one developer's machine.
 */
const project = join(dirname(fileURLToPath(import.meta.url)), '..');

test('public procedural adapter materializes supported component arrays', () => {
	const floats = createAwtsmoosComponentArray('float32', [1, 2.5, 3]);
	const indices = createAwtsmoosComponentArray('uint16', [0, 1, 2]);
	assert.ok(floats instanceof Float32Array);
	assert.ok(indices instanceof Uint16Array);
	assert.deepEqual([...floats], [1, 2.5, 3]);
	assert.deepEqual([...indices], [0, 1, 2]);
});

test('tracked Three adapter names the public component-array dependency', () => {
	const path = join(
		project,
		'../../../libs/awtsmoos-procedural-core/src/adapters/three/proceduralObjectGeometryFactory.js'
	);
	const source = readFileSync(path, 'utf8');
	assert.match(source, /\.\.\/awtsmoos\/componentArrayFactory\.js/);
});

test('unsupported component declarations fail explicitly', () => {
	assert.throws(
		() => createAwtsmoosComponentArray('mystery', [1]),
		/Unsupported component type/
	);
});
