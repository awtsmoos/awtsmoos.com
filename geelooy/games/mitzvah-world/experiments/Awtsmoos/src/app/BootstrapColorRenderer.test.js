// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapColorRenderer.test.js
 * @description Proves the bootstrap renderer paints sky, textured terrain, fog, and
 * particles through one frame without a real GPU: a mock WebGL context records the
 * call sequence while meshes, palettes, and emitters flow through the same code
 * the browser runs.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { BootstrapColorRenderer } from './BootstrapColorRenderer.js';

function mockGl() {
	let nextLocation = 1;
	const calls = [];
	const gl = {
		// Constants.
		ARRAY_BUFFER: 0x8892,
		BLEND: 0x0be2,
		COLOR_BUFFER_BIT: 0x4000,
		COMPILE_STATUS: 0x8b81,
		CULL_FACE: 0x0b44,
		DEPTH_BUFFER_BIT: 0x0100,
		DEPTH_TEST: 0x0b71,
		DYNAMIC_DRAW: 0x88e8,
		ELEMENT_ARRAY_BUFFER: 0x8893,
		FLOAT: 0x1406,
		FRAGMENT_SHADER: 0x8b30,
		LINEAR: 0x2601,
		LINEAR_MIPMAP_LINEAR: 0x2703,
		LINK_STATUS: 0x8b82,
		ONE: 1,
		ONE_MINUS_SRC_ALPHA: 0x0303,
		POINTS: 0x0000,
		REPEAT: 0x2901,
		RGBA: 0x1908,
		SRC_ALPHA: 0x0302,
		STATIC_DRAW: 0x88e4,
		TEXTURE0: 0x84c0,
		TEXTURE_2D: 0x0de1,
		TRIANGLES: 0x0004,
		UNSIGNED_BYTE: 0x1401,
		UNSIGNED_SHORT: 0x1403,
		VERTEX_SHADER: 0x8b31,
		calls
	};
	const methods = [
		'activeTexture', 'attachShader', 'bindBuffer', 'bindTexture', 'blendFunc',
		'bufferData', 'bufferSubData', 'clear', 'clearColor', 'clearDepth',
		'compileShader', 'createBuffer', 'createProgram', 'createShader', 'createTexture',
		'deleteBuffer', 'deleteProgram', 'deleteShader', 'deleteTexture',
		'depthMask', 'disable', 'disableVertexAttribArray', 'drawArrays', 'drawElements',
		'enable', 'enableVertexAttribArray', 'generateMipmap', 'linkProgram',
		'shaderSource', 'texImage2D', 'texParameteri', 'uniform1f', 'uniform1i',
		'uniform2f', 'uniform3f', 'uniform4fv', 'uniformMatrix4fv', 'useProgram',
		'vertexAttrib2f', 'vertexAttrib4f', 'vertexAttribPointer'
	];
	for (const name of methods) {
		gl[name] = (...args) => {
			calls.push(name);
			return undefined;
		};
	}
	gl.getShaderParameter = () => true;
	gl.getProgramParameter = () => true;
	gl.getProgramInfoLog = () => '';
	gl.getShaderInfoLog = () => '';
	gl.getUniformLocation = () => ({});
	gl.getAttribLocation = () => nextLocation++;
	gl.getExtension = () => null;
	gl.createBuffer = (...args) => { calls.push('createBuffer'); return {}; };
	gl.createProgram = (...args) => { calls.push('createProgram'); return {}; };
	gl.createShader = (...args) => { calls.push('createShader'); return {}; };
	gl.createTexture = (...args) => { calls.push('createTexture'); return {}; };
	return gl;
}

function mockMesh({ withMap = true, withUv = true } = {}) {
	const positions = new Float32Array(36 * 3);
	const colors = new Float32Array(36 * 4).fill(1);
	const uvs = new Float32Array(36 * 2);
	const indices = new Uint16Array(36);
	for (let i = 0; i < 36; i += 1) indices[i] = i;
	const attributes = {
		color: { array: colors, count: 36, itemSize: 4 },
		position: { array: positions, count: 36, itemSize: 3 }
	};
	if (withUv) attributes.uv = { array: uvs, count: 36, itemSize: 2 };
	return {
		geometry: { attributes, index: { array: indices, count: 36 } },
		isMesh: true,
		material: {
			baseColorFactor: [0.14, 0.44, 0.18, 1],
			color: [0.14, 0.44, 0.18, 1],
			mapImage: withMap
				? { data: new Uint8ClampedArray(4 * 4 * 4).fill(128), height: 4, width: 4 }
				: null,
			mapRepeat: [28, 30],
			vertexColors: false
		},
		matrixWorld: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
		userData: { bootstrapVisual: true },
		visible: true
	};
}

function mockScene(meshes, sky) {
	return {
		traverse: callback => meshes.forEach(callback),
		updateWorldMatrix() {},
		userData: {
			bootstrapSky: sky,
			particleEmitters: [{ key: 'lantern-1', kind: 'ember', x: 5, y: 1, z: 5 }]
		}
	};
}

function mockCamera() {
	return {
		aspect: 16 / 9,
		far: 1000,
		fov: 60,
		near: 0.1,
		position: {
			toArray() { return [this.x, this.y, this.z]; },
			x: 0,
			y: 5,
			z: 10
		},
		target: [0, 1, 0]
	};
}

test('one frame paints sky, textured mesh, and particles', () => {
	const gl = mockGl();
	const stats = { draws: 0, frames: 0, meshes: 0, triangles: 0 };
	const renderer = new BootstrapColorRenderer(gl, stats);
	renderer.render(
		mockScene([mockMesh()], { timeOfDay: 'night', timeSeconds: 42 }),
		mockCamera(),
		[0.3, 0.5, 0.7, 1]
	);
	assert.equal(stats.frames, 1);
	assert.equal(stats.meshes, 1);
	assert.ok(stats.draws >= 3, `sky + mesh + particles draw (got ${stats.draws})`);
	assert.equal(stats.triangles, 12);
	assert.ok(gl.calls.includes('texImage2D'), 'generated texture uploads to GL');
	assert.ok(gl.calls.includes('drawArrays'), 'particle points draw');
	assert.ok(gl.calls.includes('drawElements'), 'mesh draws indexed');
	renderer.dispose();
});

test('second frame reuses cached textures and sky', () => {
	const gl = mockGl();
	const stats = { draws: 0, frames: 0, meshes: 0, triangles: 0 };
	const renderer = new BootstrapColorRenderer(gl, stats);
	const scene = mockScene([mockMesh()], { timeOfDay: 'sunrise' });
	const camera = mockCamera();
	renderer.render(scene, camera, [0.3, 0.5, 0.7, 1]);
	const firstUploads = gl.calls.filter(call => call === 'texImage2D').length;
	renderer.render(scene, camera, [0.3, 0.5, 0.7, 1]);
	const secondUploads = gl.calls.filter(call => call === 'texImage2D').length;
	assert.equal(secondUploads, firstUploads, 'textures upload once, then bind from cache');
	assert.equal(stats.frames, 2);
	renderer.dispose();
});

test('meshes without maps or uvs still render (sampling disabled)', () => {
	const gl = mockGl();
	const stats = { draws: 0, frames: 0, meshes: 0, triangles: 0 };
	const renderer = new BootstrapColorRenderer(gl, stats);
	renderer.render(
		mockScene([mockMesh({ withMap: false, withUv: false })], { timeOfDay: 'day' }),
		mockCamera(),
		[0.3, 0.5, 0.7, 1]
	);
	assert.equal(stats.frames, 1);
	assert.equal(stats.triangles, 12);
	assert.ok(!gl.calls.includes('texImage2D'), 'no texture upload without a map image');
	renderer.dispose();
});

test('missing scene sky env defaults to day without throwing', () => {
	const gl = mockGl();
	const stats = { draws: 0, frames: 0, meshes: 0, triangles: 0 };
	const renderer = new BootstrapColorRenderer(gl, stats);
	renderer.render({ traverse: () => {}, updateWorldMatrix() {}, userData: {} }, mockCamera(), [0, 0, 0, 1]);
	assert.equal(stats.frames, 1);
	renderer.dispose();
});
