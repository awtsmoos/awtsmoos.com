// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-vertex-array-index-cache.test.mjs
 * @description Proves a default-VAO index bind cannot suppress the same bind inside a new VAO.
 * The Awtsmoos renews identical words within different vessels; Awtsmoos.com therefore verifies
 * that cache equality never confuses global remembrance with VAO-local element-buffer truth.
 */

import assert from 'node:assert/strict';
import { installGlStateCache } from '../tiny-gl-state-cache.js';
import { RenderVertexArrays } from '../tiny-render-vertex-arrays.js';

const ledger = [];
const extension = createVertexArrayExtension();
const gl = createFakeGl(extension, ledger);
const cache = installGlStateCache(gl);
const indexBuffer = { id: 'shared-index' };
const resource = createResource(indexBuffer);
const locations = { position: 0 };

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
const vertexArrays = new RenderVertexArrays(gl, cache);
vertexArrays.beginFrame({});
assert.equal(vertexArrays.bind(resource, locations, false), true);

const indexBinds = ledger.filter(call => (
	call.method === 'bindBuffer'
	&& call.target === gl.ELEMENT_ARRAY_BUFFER
));
assert.equal(indexBinds.length, 2);
assert.equal(indexBinds[0].vertexArray, null);
assert.equal(indexBinds[1].vertexArray?.id, 'vao-1');
assert.equal(cache.stats.vertexArrayInvalidations, 2);

vertexArrays.dispose();
cache.restore();
console.log(JSON.stringify({ indexBinds: indexBinds.length, ok: true }, null, 2));

function createVertexArrayExtension() {
	let current = null;
	let creations = 0;
	return {
		bindVertexArrayOES(value) {
			current = value;
		},
		createVertexArrayOES() {
			creations += 1;
			return { id: `vao-${creations}` };
		},
		deleteVertexArrayOES() {},
		current: () => current
	};
}

function createFakeGl(vertexArrays, calls) {
	return {
		ARRAY_BUFFER: 34962,
		ELEMENT_ARRAY_BUFFER: 34963,
		FLOAT: 5126,
		bindBuffer(target, buffer) {
			calls.push({ buffer, method: 'bindBuffer', target, vertexArray: vertexArrays.current() });
		},
		disableVertexAttribArray() {},
		enableVertexAttribArray() {},
		getExtension(name) {
			return name === 'OES_vertex_array_object' ? vertexArrays : null;
		},
		vertexAttrib4fv() {},
		vertexAttribPointer() {}
	};
}

function createResource(index) {
	return {
		attributes: {
			position: {
				attribute: { itemSize: 3, normalized: false },
				buffer: { id: 'position' }
			}
		},
		index
	};
}
