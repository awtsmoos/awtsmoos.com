// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-shadow-instancing-smoke.test.mjs
 * @description End-to-end smoke proof: one renderFrame through a recording mock
 * GL runs the shadow depth pre-pass and the instanced main pass without
 * throwing, issues instanced draw calls, and binds the shadow map unit.
 * This is the closest to a live browser this environment can lawfully reach.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { TinyWebGLRenderer } from '../tiny-webgl-renderer.js';

function createMockGl() {
	const calls = [];
	let nextId = 1;
	const id = () => nextId++;
	const gl = {
		calls,
		// Constants.
		ARRAY_BUFFER: 34962,
		ELEMENT_ARRAY_BUFFER: 34963,
		TEXTURE0: 33984,
		TEXTURE_2D: 3553,
		UNSIGNED_BYTE: 5121,
		UNSIGNED_SHORT: 5123,
		FLOAT: 5126,
		RGBA: 6408,
		LINEAR: 9729,
		CLAMP_TO_EDGE: 33071,
		TEXTURE_MIN_FILTER: 10241,
		TEXTURE_MAG_FILTER: 10240,
		TEXTURE_WRAP_S: 10242,
		TEXTURE_WRAP_T: 10243,
		FRAMEBUFFER: 36160,
		COLOR_ATTACHMENT0: 36064,
		DEPTH_ATTACHMENT: 36096,
		RENDERBUFFER: 36161,
		DEPTH_COMPONENT16: 33189,
		COLOR_BUFFER_BIT: 16384,
		DEPTH_BUFFER_BIT: 256,
		DEPTH_TEST: 2929,
		CULL_FACE: 2884,
		BACK: 1029,
		BLEND: 3042,
		SRC_ALPHA: 770,
		ONE_MINUS_SRC_ALPHA: 771,
		TRIANGLES: 4,
		STATIC_DRAW: 35044,
		VERTEX_SHADER: 35633,
		FRAGMENT_SHADER: 35632,
		COMPILE_STATUS: 35713,
		LINK_STATUS: 35714,
		MAX_VERTEX_UNIFORM_VECTORS: 36347,
		MAX_VERTEX_TEXTURE_IMAGE_UNITS: 36348,
		MAX_TEXTURE_IMAGE_UNITS: 34930,
		MAX_COMBINED_TEXTURE_IMAGE_UNITS: 35661,
		// ANGLE instancing.
		getExtension(name) {
			if (name === 'ANGLE_instanced_arrays') {
				return {
					drawElementsInstancedANGLE: (...args) => calls.push(['drawElementsInstanced', ...args]),
					drawArraysInstancedANGLE: (...args) => calls.push(['drawArraysInstanced', ...args]),
					vertexAttribDivisorANGLE: (index, divisor) => calls.push(['divisor', index, divisor])
				};
			}
			return null;
		},
		getParameter(key) {
			if (key === gl.MAX_VERTEX_UNIFORM_VECTORS) return 224;
			if (key === gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) return 16;
			if (key === gl.MAX_TEXTURE_IMAGE_UNITS) return 16;
			if (key === gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS) return 32;
			return 0;
		},
		createShader: () => id(),
		shaderSource: () => {},
		compileShader: () => {},
		getShaderParameter: () => true,
		getShaderInfoLog: () => '',
		deleteShader: () => {},
		createProgram: () => id(),
		attachShader: () => {},
		linkProgram: () => {},
		getProgramParameter: () => true,
		getProgramInfoLog: () => '',
		useProgram: program => calls.push(['useProgram', program]),
		getAttribLocation: () => id(),
		getUniformLocation: () => id(),
		createBuffer: () => id(),
		bindBuffer: () => {},
		bufferData: () => {},
		deleteBuffer: () => {},
		enableVertexAttribArray: () => {},
		disableVertexAttribArray: () => {},
		vertexAttribPointer: () => {},
		vertexAttrib4fv: () => {},
		createTexture: () => id(),
		bindTexture: () => {},
		texParameteri: () => {},
		texImage2D: () => {},
		deleteTexture: () => {},
		activeTexture: unit => calls.push(['activeTexture', unit]),
		createFramebuffer: () => id(),
		bindFramebuffer: (target, fb) => calls.push(['bindFramebuffer', fb]),
		framebufferTexture2D: () => {},
		framebufferRenderbuffer: () => {},
		deleteFramebuffer: () => {},
		createRenderbuffer: () => id(),
		bindRenderbuffer: () => {},
		renderbufferStorage: () => {},
		deleteRenderbuffer: () => {},
		viewport: (x, y, w, h) => calls.push(['viewport', w, h]),
		clearColor: () => {},
		clear: () => {},
		clearDepth: () => {},
		enable: cap => calls.push(['enable', cap]),
		disable: cap => calls.push(['disable', cap]),
		cullFace: () => {},
		blendFunc: () => {},
		depthMask: () => {},
		colorMask: () => {},
		drawElements: (...args) => calls.push(['drawElements', ...args]),
		drawArrays: (...args) => calls.push(['drawArrays', ...args]),
		uniform1i: () => {},
		uniform1f: () => {},
		uniform2f: () => {},
		uniform3f: () => {},
		uniform3fv: () => {},
		uniform4fv: () => {},
		uniform2fv: () => {},
		uniformMatrix4fv: () => {},
		pixelStorei: () => {}
	};
	return gl;
}

function triangleGeometry() {
	const attribute = (array, itemSize) => ({
		array: new Float32Array(array),
		itemSize,
		count: array.length / itemSize,
		normalized: false
	});
	return {
		mode: 4,
		attributes: {
			position: attribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3),
			normal: attribute([0, 1, 0, 0, 1, 0, 0, 1, 0], 3),
			uv: attribute([0, 0, 1, 0, 0, 1], 2)
		},
		index: null
	};
}

function sceneNode(fields) {
	return {
		visible: true,
		position: { x: 0, y: 0, z: 0 },
		quaternion: { x: 0, y: 0, z: 0, w: 1 },
		scale: { x: 1, y: 1, z: 1 },
		children: [],
		...fields
	};
}

function testScene() {
	const geometry = triangleGeometry();
	const material = { color: [0.4, 0.6, 0.3, 1] };
	const house = sceneNode({
		isMesh: true,
		name: 'house',
		geometry,
		material,
		matrixWorld: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
		userData: {}
	});
	const tuft = sceneNode({
		isMesh: true,
		name: 'grass-field',
		geometry: triangleGeometry(),
		material,
		matrixWorld: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
		userData: {
			AwtsmoosYardGrass: { reactsToPlayer: true },
			instancedVariants: [
				{
					geometry: triangleGeometry(),
					userData: {
						instanced: {
							count: 50,
							matrices: new Float32Array(50 * 16).fill(0).map((_, i) => (i % 16 === 15 ? 1 : 0)),
							revision: 1
						}
					}
				}
			]
		}
	});
	return sceneNode({ children: [house, tuft] });
}

function testCamera() {
	return {
		position: { x: 0, y: 8, z: 20 },
		target: [0, 0, 0],
		fov: 60,
		aspect: 16 / 9,
		near: 0.1,
		far: 1000
	};
}

test('B"H one frame runs the shadow pre-pass and instanced draws', () => {
	const gl = createMockGl();
	const canvas = { getContext: () => gl, width: 320, height: 180 };
	const renderer = new TinyWebGLRenderer({ canvas });
	assert.equal(renderer.instancing.supported, true);
	renderer.render(testScene(), testCamera());
	const stats = renderer.stats;
	assert.equal(stats.shadowPassDrawn, true);
	assert.ok(stats.shadowCasters >= 1, `casters ${stats.shadowCasters}`);
	assert.equal(stats.shadowMapSize, 2048);
	assert.ok(stats.draws >= 2, `draws ${stats.draws}`);
	assert.equal(stats.instancedDraws, 1);
	assert.equal(stats.instancedInstances, 50);
	// The shadow framebuffer was bound, then the default framebuffer restored.
	const fbBinds = gl.calls.filter(call => call[0] === 'bindFramebuffer');
	assert.ok(fbBinds.length >= 2, 'shadow FBO bound and released');
	assert.equal(fbBinds[fbBinds.length - 1][1], null);
	// Viewport restored to canvas size after the shadow pass.
	const viewports = gl.calls.filter(call => call[0] === 'viewport');
	assert.deepEqual(viewports[viewports.length - 1], ['viewport', 320, 180]);
	// One instanced draw call reached the (mock) GPU.
	assert.ok(gl.calls.some(call => call[0] === 'drawElementsInstanced' || call[0] === 'drawArraysInstanced'));
	// The shadow map was bound to its reserved unit during frame uniforms.
	const shadowUnit = renderer.shadowUnit;
	assert.ok(
		gl.calls.some(call => call[0] === 'activeTexture' && call[1] === gl.TEXTURE0 + shadowUnit),
		`shadow unit ${shadowUnit} bound`
	);
});

test('B"H disabling shadows skips the pre-pass but keeps rendering', () => {
	const gl = createMockGl();
	const canvas = { getContext: () => gl, width: 320, height: 180 };
	const renderer = new TinyWebGLRenderer({ canvas });
	renderer.setShadowTier('off');
	renderer.render(testScene(), testCamera());
	assert.equal(renderer.stats.shadowPassDrawn, false);
	assert.ok(renderer.stats.draws >= 2);
	assert.ok(!gl.calls.some(call => call[0] === 'bindFramebuffer'));
});
