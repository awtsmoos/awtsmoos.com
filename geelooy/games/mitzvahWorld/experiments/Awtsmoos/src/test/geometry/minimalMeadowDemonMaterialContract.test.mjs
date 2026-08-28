//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowDemonMaterialContract.test.mjs
 * @description Proves demon geometry keeps anatomical vertex modulation while the rich material exposes no generated hide before remote fur arrives.
 * The Awtsmoos creates darkness without erasing distinction; Awtsmoos.com keeps finite vertex variation beneath remote texture law,
 * so anatomy remains expressive while no canvas or solid tint may become the final creature skin we draw.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { BootstrapMeshBufferCache } from '../../app/BootstrapMeshBufferCache.js';
import { BOOTSTRAP_FRAGMENT_SHADER, BOOTSTRAP_VERTEX_SHADER } from '../../app/BootstrapColorShader.js';
import { createMinimalDemonGeometry } from '../../app/MinimalMeadowDemonGeometry.js';
import { createMinimalDemonMaterial } from '../../app/MinimalMeadowDemonMaterial.js';

test('anatomical vertex colors remain finite and varied', () => {
	const values = createMinimalDemonGeometry().attributes.color.array;
	assert.ok(values.length > 1000);
	assert.ok([...values].every(Number.isFinite));
	assert.ok(uniqueColors(values).size > 100);
});

test('rich material waits for remote fur while retaining vertex modulation', () => {
	const material = createMinimalDemonMaterial({ id: 'contract-violet', tint: [0.72, 0.45, 0.95, 1] });
	assert.equal(material.vertexColors, true);
	assert.equal(material.mapImage, null);
	assert.equal(material.texturePolicy.remoteOnly, true);
	assert.equal(material.texturePolicy.semanticRole, 'creature.fur');
	assert.equal(material.texturePolicy.vertexColorModulation, true);
	assert.equal(material.texturePolicy.realMapImage, false);
});

test('bootstrap geometry uploads vertex modulation once', () => {
	const { calls, gl } = fakeGl();
	const cache = new BootstrapMeshBufferCache(gl);
	const first = cache.resolve(createMinimalDemonGeometry());
	assert.ok(first.colorBuffer);
	assert.equal(first.colorItemSize, 4);
	assert.equal(calls.createdBuffers, 2);
	cache.bindColor(first, 3, 0);
	assert.equal(calls.colorPointers, 1);
});

test('bootstrap shader multiplies remote-ready tint by vertex color', () => {
	assert.match(BOOTSTRAP_VERTEX_SHADER, /attribute vec4 aColor/);
	assert.match(BOOTSTRAP_FRAGMENT_SHADER, /uColor \* vColor/);
});

function uniqueColors(values) {
	const unique = new Set();
	for (let offset = 0; offset < values.length; offset += 4) {
		unique.add([...values.slice(offset, offset + 4)].map(value => value.toFixed(3)).join(','));
	}
	return unique;
}

function fakeGl() {
	const calls = { colorPointers: 0, createdBuffers: 0 };
	const empty = () => undefined;
	return {
		calls,
		gl: {
			ARRAY_BUFFER: 1, BYTE: 2, ELEMENT_ARRAY_BUFFER: 3, FLOAT: 4, SHORT: 5,
			STATIC_DRAW: 6, UNSIGNED_BYTE: 7, UNSIGNED_INT: 8, UNSIGNED_SHORT: 9,
			bindBuffer: empty, bufferData: empty,
			createBuffer: () => ({ id: ++calls.createdBuffers }),
			disableVertexAttribArray: empty, enableVertexAttribArray: empty,
			getExtension: () => ({}), vertexAttrib4f: empty,
			vertexAttribPointer: () => { calls.colorPointers += 1; }
		}
	};
}
