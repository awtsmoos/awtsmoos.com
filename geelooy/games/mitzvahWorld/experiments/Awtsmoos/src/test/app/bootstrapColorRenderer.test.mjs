// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapColorRenderer.test.mjs
 * @description Proves eleven visible meshes use one program and one shared geometry upload.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	PerspectiveCamera,
	Scene
} from '../../../../light-three-gltf/tiny-runtime.js';
import { BootstrapColorRenderer } from '../../app/BootstrapColorRenderer.js';
import { createProgressiveStats } from '../../app/ProgressiveWebGLDefaults.js';
import { createBootstrapVisiblePlayer } from '../../app/BootstrapVisiblePlayer.js';
import { createBootstrapVisibleWorld } from '../../app/BootstrapVisibleWorld.js';

function createFakeGl() {
	const calls = { buffers: 0, draws: 0, programs: 0 };
	const gl = {
		ARRAY_BUFFER: 1,
		COLOR_BUFFER_BIT: 2,
		COMPILE_STATUS: 3,
		CULL_FACE: 4,
		DEPTH_BUFFER_BIT: 8,
		DEPTH_TEST: 9,
		ELEMENT_ARRAY_BUFFER: 10,
		FLOAT: 11,
		FRAGMENT_SHADER: 12,
		LINK_STATUS: 13,
		STATIC_DRAW: 14,
		TRIANGLES: 15,
		UNSIGNED_SHORT: 16,
		VERTEX_SHADER: 17,
		attachShader() {},
		bindBuffer() {},
		bufferData() {},
		clear() {},
		clearColor() {},
		clearDepth() {},
		compileShader() {},
		createBuffer() { calls.buffers += 1; return {}; },
		createProgram() { calls.programs += 1; return {}; },
		createShader() { return {}; },
		deleteProgram() {},
		deleteShader() {},
		disable() {},
		drawArrays() { calls.draws += 1; },
		drawElements() { calls.draws += 1; },
		enable() {},
		enableVertexAttribArray() {},
		getAttribLocation() { return 0; },
		getProgramInfoLog() { return ''; },
		getProgramParameter() { return true; },
		getShaderInfoLog() { return ''; },
		getShaderParameter() { return true; },
		getUniformLocation(_program, name) { return name; },
		linkProgram() {},
		shaderSource() {},
		uniform4fv() {},
		uniformMatrix4fv() {},
		useProgram() {},
		vertexAttribPointer() {}
	};
	return { calls, gl };
}

test('colored bootstrap renderer draws bounded visible world and player', () => {
	const { calls, gl } = createFakeGl();
	const stats = createProgressiveStats();
	const renderer = new BootstrapColorRenderer(gl, stats);
	const scene = new Scene();
	scene.add(createBootstrapVisibleWorld());
	scene.add(createBootstrapVisiblePlayer());
	const camera = new PerspectiveCamera(45, 16 / 9, 0.1, 200);
	camera.position.set(0, 4.2, -7);
	camera.target = [0, 1.25, 0];
	renderer.render(scene, camera, [0.36, 0.56, 0.72, 1]);
	assert.equal(calls.programs, 1);
	assert.equal(calls.buffers, 2);
	assert.equal(calls.draws, 11);
	assert.equal(stats.draws, 11);
	assert.equal(stats.meshes, 11);
	assert.equal(stats.triangles, 132);
});
