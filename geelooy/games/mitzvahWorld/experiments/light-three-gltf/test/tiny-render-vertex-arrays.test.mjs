// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-vertex-arrays.test.mjs
 * @description Proves exact VAO creation, switching, fallback constants, and bounded invalidation.
 * The Awtsmoos rests no truth on an extension alone; Awtsmoos.com verifies resident and manual
 * doorways while ordinary VAO switches never erase the preserved default-array state.
 */

import assert from 'node:assert/strict';
import { RenderVertexArrays } from '../tiny-render-vertex-arrays.js';

const ledger = {
	binds: [],
	constants: [],
	creates: 0,
	deletes: [],
	invalidations: 0
};
const extension = {
	bindVertexArrayOES(vertexArray) {
		ledger.binds.push(vertexArray);
	},
	createVertexArrayOES() {
		ledger.creates += 1;
		return { id: `vao-${ledger.creates}` };
	},
	deleteVertexArrayOES(vertexArray) {
		ledger.deletes.push(vertexArray);
	}
};
const gl = createFakeGl(extension, ledger);
const cache = {
	invalidateVertexArrayState() {
		ledger.invalidations += 1;
	}
};
const vertexArrays = new RenderVertexArrays(gl, cache);
const stats = {};
vertexArrays.beginFrame(stats);
const first = createResource('first');
const second = createResource('second');
const locations = {
	position: 0,
	normal: 1,
	color: 2,
	uv: 3,
	joints: 4,
	weights: 5
};

assert.equal(vertexArrays.bind(first, locations, false), true);
assert.equal(vertexArrays.bind(first, locations, false), true);
assert.equal(vertexArrays.bind(second, locations, false), true);
assert.equal(vertexArrays.bind(first, locations, false), true);
assert.equal(stats.vertexArrays.supported, true);
assert.equal(stats.vertexArrays.creations, 2);
assert.equal(stats.vertexArrays.binds, 3);
assert.equal(stats.vertexArrays.skips, 1);
assert.equal(stats.vertexArrays.fallbackUploads, 5);
assert.equal(stats.vertexArrays.fallbackSkips, 15);
assert.equal(stats.vertexArrays.invalidations, 2);
assert.equal(ledger.invalidations, 2);
assert.equal(ledger.binds.length, 8);
assert.equal(ledger.constants.length, 5);

assert.equal(vertexArrays.releaseToDefault(), true);
assert.equal(ledger.binds.length, 9);
assert.equal(ledger.invalidations, 2);
vertexArrays.dispose();
assert.equal(ledger.deletes.length, 2);

const unsupportedStats = {};
const unsupported = new RenderVertexArrays(createFakeGl(null, ledger), cache);
unsupported.beginFrame(unsupportedStats);
assert.equal(unsupported.bind(first, locations, false), false);
assert.equal(unsupportedStats.vertexArrays.supported, false);

function createFakeGl(extensionValue, calls) {
	return {
		ARRAY_BUFFER: 34962,
		ELEMENT_ARRAY_BUFFER: 34963,
		FLOAT: 5126,
		bindBuffer() {},
		disableVertexAttribArray() {},
		enableVertexAttribArray() {},
		getExtension(name) {
			return name === 'OES_vertex_array_object' ? extensionValue : null;
		},
		vertexAttrib4fv(location, values) {
			calls.constants.push([location, ...values]);
		},
		vertexAttribPointer() {}
	};
}

function createResource(id) {
	return {
		attributes: {
			position: {
				attribute: {
					array: new Float32Array([0, 0, 0]),
					itemSize: 3,
					normalized: false
				},
				buffer: { id: `position-${id}` }
			},
			normal: null,
			color: null,
			uv: null,
			joints: null,
			weights: null
		},
		index: { id: `index-${id}` }
	};
}
