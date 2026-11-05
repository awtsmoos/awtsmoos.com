// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-instancing.test.mjs
 * @description Proves GPU instancing detection, payload validation, and the
 * instanced vertex shader contract: one tuft geometry, per-instance matrices,
 * divisor-stepped attributes, with the CPU merge path kept as fallback.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	INSTANCE_MATRIX_ATTRIBUTES,
	INSTANCE_MATRIX_FLOATS,
	detectInstancing,
	instanceCountFor,
	isInstancedMesh,
	validInstanceMatrices
} from '../tiny-instancing.js';
import { unifiedInstancedVertexShader } from '../tiny-unified-shaders.js';

function webgl2Mock() {
	return {
		drawElementsInstanced() {},
		vertexAttribDivisor() {},
		getExtension() { return null; }
	};
}

function angleMock() {
	const calls = [];
	return {
		gl: {
			getExtension(name) {
				assert.equal(name, 'ANGLE_instanced_arrays');
				return {
					drawArraysInstancedANGLE(...args) { calls.push(['drawArrays', ...args]); },
					drawElementsInstancedANGLE(...args) { calls.push(['drawElements', ...args]); },
					vertexAttribDivisorANGLE(index, divisor) { calls.push(['divisor', index, divisor]); }
				};
			}
		},
		calls
	};
}

test('B"H WebGL2 native instancing is detected and preferred', () => {
	const instancing = detectInstancing(webgl2Mock());
	assert.equal(instancing.supported, true);
	assert.equal(instancing.isWebGL2, true);
	assert.equal(typeof instancing.drawElementsInstanced, 'function');
	assert.equal(typeof instancing.vertexAttribDivisor, 'function');
});

test('B"H ANGLE_instanced_arrays backs WebGL1 instancing', () => {
	const { gl, calls } = angleMock();
	const instancing = detectInstancing(gl);
	assert.equal(instancing.supported, true);
	assert.equal(instancing.isWebGL2, false);
	instancing.vertexAttribDivisor(3, 1);
	instancing.drawElementsInstanced(4, 36, 5123, 0, 100);
	assert.deepEqual(calls[0], ['divisor', 3, 1]);
	assert.deepEqual(calls[1], ['drawElements', 4, 36, 5123, 0, 100]);
});

test('B"H missing extension yields null (CPU merge stays the fallback)', () => {
	assert.equal(detectInstancing({ getExtension: () => null }), null);
	assert.equal(detectInstancing(null), null);
	assert.equal(detectInstancing({}), null);
});

test('B"H instanced mesh payloads are validated strictly', () => {
	const good = {
		userData: {
			instanced: { count: 3, matrices: new Float32Array(3 * INSTANCE_MATRIX_FLOATS) }
		}
	};
	assert.equal(isInstancedMesh(good), true);
	assert.equal(instanceCountFor(good), 3);
	assert.equal(isInstancedMesh({ userData: {} }), false);
	assert.equal(isInstancedMesh(null), false);
	assert.equal(
		isInstancedMesh({ userData: { instanced: { count: 0, matrices: new Float32Array(16) } } }),
		false
	);
	assert.equal(
		isInstancedMesh({ userData: { instanced: { count: 2, matrices: new Float32Array(16) } } }),
		false
	);
	assert.equal(
		isInstancedMesh({ userData: { instanced: { count: 2, matrices: [1, 2, 3] } } }),
		false
	);
});

test('B"H non-finite instance matrices are rejected', () => {
	const matrices = new Float32Array(2 * INSTANCE_MATRIX_FLOATS);
	assert.equal(validInstanceMatrices(matrices, 2), 2);
	matrices[17] = Number.NaN;
	assert.equal(validInstanceMatrices(matrices, 2), 0);
	assert.equal(validInstanceMatrices(matrices, 5), 0);
});

test('B"H instanced vertex shader carries four divisor attributes and no skinning', () => {
	const source = unifiedInstancedVertexShader();
	for (const name of INSTANCE_MATRIX_ATTRIBUTES) {
		assert.match(source, new RegExp(`attribute vec4 ${name};`));
	}
	assert.match(source, /mat4\(aInstanceMatrix0,aInstanceMatrix1,aInstanceMatrix2,aInstanceMatrix3\)/);
	assert.match(source, /instanceMatrix\*vec4\(aPosition,1\.0\)/);
	assert.match(source, /applyVegetationMotion/);
	assert.doesNotMatch(source, /aJoints/);
	assert.doesNotMatch(source, /uJointMatrices/);
});
