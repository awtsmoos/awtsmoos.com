// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicSceneResources
 * @description
 * The Awtsmoos gathers shaders, buffers, and a few Hebrew letters into one
 * accountable vessel. Awtsmoos.com can therefore release and recreate them whole.
 */
import { createWebGLProgram } from './program.js';
import { createParticleLayout, PARTICLE_STRIDE_FLOATS } from './particleLayout.js';
import { createHebrewGlyphAtlas } from './glyphAtlas.js';
import { createSeededRandom } from './seededRandom.js';
import { NEBULA_VERTEX_SHADER } from './shaders/nebulaVertex.js';
import { NEBULA_FRAGMENT_SHADER } from './shaders/nebulaFragment.js';
import { PARTICLE_VERTEX_SHADER } from './shaders/particleVertex.js';
import { PARTICLE_FRAGMENT_SHADER } from './shaders/particleFragment.js';
import { GLYPH_VERTEX_SHADER } from './shaders/glyphVertex.js';
import { GLYPH_FRAGMENT_SHADER } from './shaders/glyphFragment.js';

/**
 * Creates every GPU resource required by the cosmic scene.
 *
 * @param {WebGL2RenderingContext} gl - Active context.
 * @param {object} profile - Selected performance profile.
 * @returns {object} Programs, buffers, texture, counts, and stride.
 */
export function buildSceneResources(gl, profile) {
	const particles = createParticleLayout(profile.particles, 'geelooy-cosmic-feed');
	const particleBuffer = createArrayBuffer(gl, particles);
	const glyphValues = createGlyphLayout(profile.glyphs);
	const glyphBuffer = createArrayBuffer(gl, glyphValues);
	const atlasTexture = profile.glyphs > 0 ? createAtlasTexture(gl) : null;

	return {
		vao: gl.createVertexArray(),
		nebulaProgram: createWebGLProgram(gl, NEBULA_VERTEX_SHADER, NEBULA_FRAGMENT_SHADER),
		particleProgram: createWebGLProgram(gl, PARTICLE_VERTEX_SHADER, PARTICLE_FRAGMENT_SHADER),
		glyphProgram: profile.glyphs > 0
			? createWebGLProgram(gl, GLYPH_VERTEX_SHADER, GLYPH_FRAGMENT_SHADER)
			: null,
		particleBuffer,
		glyphBuffer,
		atlasTexture,
		particleCount: profile.particles,
		glyphCount: profile.glyphs,
		particleStride: PARTICLE_STRIDE_FLOATS * Float32Array.BYTES_PER_ELEMENT
	};
}

/**
 * Deletes all resources created for the scene.
 *
 * @param {WebGL2RenderingContext} gl - Active context.
 * @param {object|null} resources - Existing resource bundle.
 */
export function destroySceneResources(gl, resources) {
	if (!resources) {
		return;
	}

	gl.deleteProgram(resources.nebulaProgram);
	gl.deleteProgram(resources.particleProgram);
	gl.deleteProgram(resources.glyphProgram);
	gl.deleteBuffer(resources.particleBuffer);
	gl.deleteBuffer(resources.glyphBuffer);
	gl.deleteTexture(resources.atlasTexture);
	gl.deleteVertexArray(resources.vao);
}

function createArrayBuffer(gl, values) {
	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, values, gl.STATIC_DRAW);
	return buffer;
}

function createGlyphLayout(count) {
	const random = createSeededRandom('geelooy-hebrew-constellations');
	const values = new Float32Array(count * 4);

	for (let index = 0; index < count; index += 1) {
		const offset = index * 4;
		const side = random() < 0.5 ? -1 : 1;
		values[offset] = side * (0.66 + random() * 0.3);
		values[offset + 1] = random() * 1.8 - 0.9;
		values[offset + 2] = Math.floor(random() * 7);
		values[offset + 3] = random() * Math.PI * 2;
	}

	return values;
}

function createAtlasTexture(gl) {
	const atlas = createHebrewGlyphAtlas();
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas);
	return texture;
}
