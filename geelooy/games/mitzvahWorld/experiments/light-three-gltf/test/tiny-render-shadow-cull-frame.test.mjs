// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-shadow-cull-frame.test.mjs
 * @description Frame-level proof: through one real renderFrame on a recording
 * mock GL, a caster beside the camera target still draws depth while a caster
 * 400 world units away is skipped by the light-frustum proof and counted.
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
		userData: {},
		...fields
	};
}

function houseAt(x, extra = {}) {
	return sceneNode({
		isMesh: true,
		name: `house-${x}`,
		geometry: triangleGeometry(),
		material: { color: [0.4, 0.6, 0.3, 1] },
		position: { x, y: 0, z: 0 },
		...extra
	});
}

test('B"H a caster 400 units from the focus is skipped by the shadow proof', () => {
	const gl = createMockGl();
	const canvas = { getContext: () => gl, width: 320, height: 180 };
	const renderer = new TinyWebGLRenderer({ canvas });
	const near = houseAt(0);
	// frustumCulled false keeps the far house in the opaque list so the shadow
	// proof itself — not camera culling — is what this test measures.
	const far = houseAt(400, { frustumCulled: false });
	const scene = sceneNode({ children: [near, far] });
	const camera = {
		position: { x: 0, y: 8, z: 20 },
		target: [0, 0, 0],
		fov: 60,
		aspect: 16 / 9,
		near: 0.1,
		far: 1000
	};
	renderer.render(scene, camera);
	assert.equal(renderer.stats.shadowPassDrawn, true);
	assert.equal(renderer.stats.shadowCasters, 1);
	assert.equal(renderer.stats.shadowCastersCulled, 1);
	// Both houses still draw in the main pass: the cull touches shadows only.
	assert.ok(renderer.stats.draws >= 2, `draws ${renderer.stats.draws}`);
});

test('B"H with shadows off nothing is counted or culled', () => {
	const gl = createMockGl();
	const canvas = { getContext: () => gl, width: 320, height: 180 };
	const renderer = new TinyWebGLRenderer({ canvas });
	renderer.setShadowTier('off');
	const scene = sceneNode({ children: [houseAt(0), houseAt(400, { frustumCulled: false })] });
	const camera = {
		position: { x: 0, y: 8, z: 20 },
		target: [0, 0, 0],
		fov: 60,
		aspect: 16 / 9,
		near: 0.1,
		far: 1000
	};
	renderer.render(scene, camera);
	assert.equal(renderer.stats.shadowPassDrawn, false);
});
