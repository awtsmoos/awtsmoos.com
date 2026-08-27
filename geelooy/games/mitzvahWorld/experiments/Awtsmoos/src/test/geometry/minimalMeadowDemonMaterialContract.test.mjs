// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowDemonMaterialContract.test.mjs
 * @description Proves finite patterned colors and bootstrap transport for textured demons.
 * The Awtsmoos creates darkness without erasing distinction; Awtsmoos.com verifies each channel,
 * shared texture vessel, shader doorway, and fallback before browser light is trusted.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { BootstrapMeshBufferCache } from '../../app/BootstrapMeshBufferCache.js';
import { BOOTSTRAP_FRAGMENT_SHADER, BOOTSTRAP_VERTEX_SHADER } from '../../app/BootstrapColorShader.js';
import { createMinimalDemonGeometry } from '../../app/MinimalMeadowDemonGeometry.js';
import { createMinimalDemonMaterial } from '../../app/MinimalMeadowDemonMaterial.js';

const documentValue = createFakeDocument();

test('procedural colors are finite, varied, and anatomically readable', () => {
	const values = createMinimalDemonGeometry().attributes.color.array;
	assert.ok(values.length > 1000);
	assert.ok([...values].every(Number.isFinite));
	const unique = uniqueColors(values);
	assert.ok(unique.size > 100);
	assert.ok([...unique].some(color => color.startsWith('1.000,0.160,0.045')));
});

test('rich material preserves texture, vertex color, and readable tint', () => {
	const material = createMinimalDemonMaterial({
		id: 'contract-violet',
		surfaceFamily: 'violet-ash',
		tint: [0.72, 0.45, 0.95, 1]
	}, documentValue);
	assert.equal(material.vertexColors, true);
	assert.equal(material.mapImage.width, 256);
	assert.equal(material.texturePolicy.closedSurface, true);
	assert.ok(material.color.slice(0, 3).every(channel => channel >= 0.14 && channel < 0.67));
});

test('shared geometry uploads procedural color once for bootstrap', () => {
	const { calls, gl } = fakeGl();
	const cache = new BootstrapMeshBufferCache(gl);
	const geometry = createMinimalDemonGeometry();
	const first = cache.resolve(geometry);
	assert.equal(first, cache.resolve(geometry));
	assert.ok(first.colorBuffer);
	assert.equal(first.colorItemSize, 4);
	assert.equal(calls.createdBuffers, 2);
	cache.bindColor(first, 3, 0);
	assert.equal(calls.colorPointers, 1);
});

test('bootstrap shader multiplies profile tint by vertex color', () => {
	assert.match(BOOTSTRAP_VERTEX_SHADER, /attribute vec4 aColor/);
	assert.match(BOOTSTRAP_VERTEX_SHADER, /vColor = aColor/);
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
			ARRAY_BUFFER: 1,
			BYTE: 2,
			ELEMENT_ARRAY_BUFFER: 3,
			FLOAT: 4,
			SHORT: 5,
			STATIC_DRAW: 6,
			UNSIGNED_BYTE: 7,
			UNSIGNED_INT: 8,
			UNSIGNED_SHORT: 9,
			bindBuffer: empty,
			bufferData: empty,
			createBuffer: () => ({ id: ++calls.createdBuffers }),
			disableVertexAttribArray: empty,
			enableVertexAttribArray: empty,
			getExtension: () => ({}),
			vertexAttrib4f: empty,
			vertexAttribPointer: () => { calls.colorPointers += 1; }
		}
	};
}

function createFakeDocument() {
	return {
		createElement: () => ({
			dataset: {},
			height: 0,
			width: 0,
			getContext: () => createFakeContext()
		})
	};
}

function createFakeContext() {
	return {
		globalAlpha: 1,
		beginPath() {},
		bezierCurveTo() {},
		createRadialGradient: () => ({ addColorStop() {} }),
		fillRect() {},
		moveTo() {},
		stroke() {}
	};
}
