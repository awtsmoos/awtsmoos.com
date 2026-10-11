// B"H
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGrassFieldMesh } from '../src/core/geometry/grass/createGrassFieldMesh.js';
import { createMeadowGrassTints } from '../src/core/webgl/grass/meadowGrassTints.js';
import { createMeadowGrassGlBinding } from '../src/core/webgl/grass/MeadowGrassGlRenderer.js';
import { createMeadowParticleGlBinding } from '../src/core/webgl/particles/MeadowParticleGlRenderer.js';
import { createMeadowAmbientParticleField } from '../src/core/webgl/particles/MeadowAmbientParticleField.js';
import { createFireflyParticleEffect } from '../src/core/proceduralObject/particles/effects/presets/nature/createFireflyParticleEffect.js';

/** Minimal WebGL2 mock that records calls and pretends compilation succeeds. */
function createMockGl() {
	const calls = [];
	let nextId = 1;
	const attribLocations = new Map();
	const uniformLocations = new Map();
	const gl = {
		VERTEX_SHADER: 0x8b31,
		FRAGMENT_SHADER: 0x8b30,
		COMPILE_STATUS: 0x8b81,
		LINK_STATUS: 0x8b82,
		ARRAY_BUFFER: 0x8892,
		ELEMENT_ARRAY_BUFFER: 0x8893,
		STATIC_DRAW: 0x88e4,
		DYNAMIC_DRAW: 0x88e8,
		FLOAT: 0x1406,
		UNSIGNED_SHORT: 0x1403,
		UNSIGNED_INT: 0x1405,
		TRIANGLES: 0x0004,
		POINTS: 0x0000,
		DEPTH_TEST: 0x0b71,
		BLEND: 0x0be2,
		CULL_FACE: 0x0b44,
		DEPTH_WRITEMASK: 0x0b72,
		BLEND_SRC_RGB: 0x80c9,
		BLEND_DST_RGB: 0x80c8,
		SRC_ALPHA: 0x0302,
		ONE: 1,
		ONE_MINUS_SRC_ALPHA: 0x0303,
		CURRENT_PROGRAM: 0x8b8d,
		calls,
		createShader: () => ({ mockShader: nextId++ }),
		shaderSource: () => {},
		compileShader: () => {},
		getShaderParameter: () => true,
		getShaderInfoLog: () => '',
		deleteShader: () => {},
		createProgram: () => ({ mockProgram: nextId++ }),
		attachShader: () => {},
		linkProgram: () => {},
		getProgramParameter: () => true,
		getProgramInfoLog: () => '',
		deleteProgram: () => {},
		getAttribLocation: (program, name) => {
			if (!attribLocations.has(name)) attribLocations.set(name, attribLocations.size);
			return attribLocations.get(name);
		},
		getUniformLocation: (program, name) => {
			if (!uniformLocations.has(name)) uniformLocations.set(name, `u:${name}`);
			return uniformLocations.get(name);
		},
		createBuffer: () => ({ mockBuffer: nextId++ }),
		bindBuffer: (target, buffer) => calls.push(['bindBuffer', target]),
		bufferData: (target, data) => calls.push(['bufferData', target, data?.byteLength ?? data?.length]),
		bufferSubData: () => calls.push(['bufferSubData']),
		enableVertexAttribArray: (loc) => calls.push(['enableVertexAttribArray', loc]),
		disableVertexAttribArray: (loc) => calls.push(['disableVertexAttribArray', loc]),
		vertexAttribPointer: () => {},
		vertexAttribDivisor: (loc, divisor) => calls.push(['vertexAttribDivisor', loc, divisor]),
		vertexAttrib1f: () => {},
		vertexAttrib3f: () => {},
		useProgram: (program) => calls.push(['useProgram', program?true:false]),
		enable: (cap) => calls.push(['enable', cap]),
		disable: (cap) => calls.push(['disable', cap]),
		getParameter: (name) => {
			if (name === gl.CURRENT_PROGRAM) return null;
			return false;
		},
		uniform1f: () => {},
		uniform1i: () => {},
		uniform3f: () => {},
		uniform3fv: () => {},
		uniform1fv: () => {},
		uniformMatrix4fv: () => {},
		drawElementsInstanced: (mode, count, type, offset, instances) => {
			calls.push(['drawElementsInstanced', mode, count, type, instances]);
		},
		drawElements: () => calls.push(['drawElements']),
		drawArrays: (mode, first, count) => calls.push(['drawArrays', mode, first, count]),
		blendFunc: () => {},
		depthMask: () => {},
		deleteBuffer: () => {},
		getExtension: () => null
	};
	return gl;
}

const IDENTITY_16 = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

test('grass binding draws one instanced call with divisors set and reset', () => {
	const gl = createMockGl();
	const fieldMesh = createGrassFieldMesh({ seed: 'gl-test', count: 120, heightAt: () => 0 });
	const tints = createMeadowGrassTints(fieldMesh, { seed: 'gl-tint' });
	const binding = createMeadowGrassGlBinding(gl, fieldMesh, { tints });
	assert.ok(binding, 'binding created');
	assert.equal(binding.instanced, 'webgl2');
	assert.equal(binding.instanceCount, fieldMesh.instanceCount);
	binding.render({
		projectionMatrix: IDENTITY_16,
		viewMatrix: IDENTITY_16,
		timeSeconds: 4.2,
		timeOfDay: 'sunrise',
		interactors: [{ x: 1, y: 0, z: 2, radius: 1.5 }]
	});
	const draws = gl.calls.filter(call => call[0] === 'drawElementsInstanced');
	assert.equal(draws.length, 1, 'exactly one instanced draw');
	assert.equal(draws[0][4], fieldMesh.instanceCount, 'draws every instance');
	const divisors = gl.calls.filter(call => call[0] === 'vertexAttribDivisor');
	assert.ok(divisors.some(call => call[2] === 1), 'divisors set to 1 for instancing');
	assert.ok(divisors.some(call => call[2] === 0), 'divisors reset to 0 afterwards');
	binding.dispose();
});

test('grass binding returns null for empty fields', () => {
	const gl = createMockGl();
	assert.equal(createMeadowGrassGlBinding(gl, { instanceCount: 0 }), null);
	assert.equal(createMeadowGrassGlBinding(null, { instanceCount: 5 }), null);
});

test('particle binding streams a packed field as points', () => {
	const gl = createMockGl();
	const field = createMeadowAmbientParticleField(
		createFireflyParticleEffect({ id: 'gl-p', count: 60 })
	);
	const binding = createMeadowParticleGlBinding(gl, field.count);
	field.update(0.016, { time: 1 });
	const packed = field.pack(1);
	binding.render(packed, IDENTITY_16, { additive: true, sizeScale: 900, globalAlpha: 0.8 });
	const draws = gl.calls.filter(call => call[0] === 'drawArrays');
	assert.equal(draws.length, 1, 'one point draw');
	assert.equal(draws[0][1], gl.POINTS, 'draws points');
	assert.equal(draws[0][3], 60, 'draws every particle');
	assert.ok(gl.calls.some(call => call[0] === 'bufferSubData'), 'streams dynamic buffers');
	binding.render({ count: 0 }, IDENTITY_16, {});
	binding.dispose();
});
