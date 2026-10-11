// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeadowGrassGlRenderer.js
 * @description Real WebGL renderer for the core's instanced grass field meshes.
 * The Awtsmoos renews thousands of blades in one draw before the wind can count them;
 * Awtsmoos.com binds the canonical grass shaders (wind sway, translucency, per-blade
 * phase) with per-instance golden tints and CPU-driven gust fronts, so the meadow
 * moves as countless related lives rather than one synchronized sheet.
 */

import { VS_SOURCE_GRASS } from '../shaders/grass/vertex.js';
import { FS_SOURCE_GRASS } from '../shaders/grass/fragment.js';
import { TONE_MAPPING_GLSL } from '../shaders/utils/toneMapping.js';

/** Named wind defaults: direction XZ and base strength for the dream meadow. */
export const MEADOW_WIND_DEFAULT = Object.freeze({
	direction: Object.freeze([0.8, 0.0, 0.35]),
	baseStrength: 0.5,
	turbulence: 0.7,
	wetness: 0.0,
	recovery: 0.85
});

/** Named light presets keyed by the meadow sky's time of day. */
export const MEADOW_GRASS_LIGHT = Object.freeze({
	day: Object.freeze({
		ambient: Object.freeze([0.42, 0.48, 0.52]),
		directional: Object.freeze([1.15, 1.08, 0.95]),
		direction: Object.freeze([0.45, 0.8, 0.35])
	}),
	sunrise: Object.freeze({
		ambient: Object.freeze([0.5, 0.4, 0.34]),
		directional: Object.freeze([1.5, 0.95, 0.55]),
		direction: Object.freeze([0.85, 0.28, 0.2])
	}),
	night: Object.freeze({
		ambient: Object.freeze([0.14, 0.18, 0.28]),
		directional: Object.freeze([0.32, 0.42, 0.62]),
		direction: Object.freeze([-0.4, 0.75, -0.3])
	})
});

const MAX_INTERACTORS = 5;

/** Expands canonical `#include <name>` chunks before compilation. */
export function resolveGrassShaderSources() {
	return Object.freeze({
		vertex: VS_SOURCE_GRASS,
		fragment: FS_SOURCE_GRASS.replace(
			/#include\s+<toneMapping>/g,
			() => TONE_MAPPING_GLSL
		)
	});
}

/**
 * Traveling gust fronts: slow swells with faster ripples riding on top.
 * @param {number} timeSeconds Meadow clock.
 * @returns {number} Strength multiplier in roughly [0.35, 1.65].
 */
export function sampleMeadowGust(timeSeconds) {
	const time = Number(timeSeconds) || 0;
	const swell = Math.sin(time * 0.23) * 0.5 + Math.sin(time * 0.11 + 1.7) * 0.5;
	const ripple = Math.sin(time * 0.9 + 0.6) * 0.25 + Math.sin(time * 1.7 + 2.3) * 0.15;
	return Math.max(0.3, 1 + swell * 0.45 + ripple * 0.35);
}

function compileShader(gl, type, source, label) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader) || 'unknown';
		try { gl.deleteShader(shader); } catch {}
		throw new Error(`MeadowGrassGlRenderer ${label} failed: ${log}`);
	}
	return shader;
}

/** Compiles and links the canonical grass program. */
export function createMeadowGrassGlProgram(gl) {
	const sources = resolveGrassShaderSources();
	const vertex = compileShader(gl, gl.VERTEX_SHADER, sources.vertex, 'vertex');
	const fragment = compileShader(gl, gl.FRAGMENT_SHADER, sources.fragment, 'fragment');
	const program = gl.createProgram();
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);
	try { gl.deleteShader(vertex); } catch {}
	try { gl.deleteShader(fragment); } catch {}
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const log = gl.getProgramInfoLog(program) || 'unknown';
		try { gl.deleteProgram(program); } catch {}
		throw new Error(`MeadowGrassGlRenderer link failed: ${log}`);
	}
	const attribute = (name) => gl.getAttribLocation(program, name);
	const uniform = (name) => gl.getUniformLocation(program, name);
	return Object.freeze({
		program,
		attributes: Object.freeze({
			position: attribute('aVertexPosition'),
			offset: attribute('aInstanceOffset'),
			scale: attribute('aInstanceScale'),
			rotation: attribute('aInstanceRotation'),
			bend: attribute('aInstanceBend'),
			windPhase: attribute('aInstanceWindPhase'),
			tint: attribute('aInstanceTint')
		}),
		uniforms: Object.freeze({
			projectionMatrix: uniform('uProjectionMatrix'),
			modelViewMatrix: uniform('uModelViewMatrix'),
			time: uniform('uTime'),
			windVector: uniform('uWindVector'),
			windStrength: uniform('uWindStrength'),
			turbulence: uniform('uGrassTurbulence'),
			wetness: uniform('uGrassWetness'),
			recovery: uniform('uGrassRecovery'),
			tintStrength: uniform('uTintStrength'),
			interactorCount: uniform('uInteractorCount'),
			interactors: uniform('uInteractors[0]'),
			interactorRadius: uniform('uInteractorRadius[0]'),
			ambientLightColor: uniform('uAmbientLightColor'),
			directionalLightColor: uniform('uDirectionalLightColor'),
			lightDirection: uniform('uLightDirection')
		}),
		dispose() {
			try { gl.deleteProgram(program); } catch {}
		}
	});
}

function bindAttribute(gl, location, buffer, size, divisorMode) {
	if (location < 0 || !buffer) return;
	const divisor = divisorMode ? 1 : 0;
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.enableVertexAttribArray(location);
	gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
	if (divisorMode === 'webgl2') {
		gl.vertexAttribDivisor(location, divisor);
	} else if (divisorMode === 'angle') {
		gl.getExtension('ANGLE_instanced_arrays')?.vertexAttribDivisorANGLE(location, divisor);
	}
}

/** Sets a constant vertex attribute value (used when the array stays disabled). */
function setConstantAttribute(gl, location, values) {
	if (location < 0) return;
	try { gl.disableVertexAttribArray(location); } catch {}
	if (values.length === 1) gl.vertexAttrib1f(location, values[0]);
	else if (values.length === 2) gl.vertexAttrib2f(location, values[0], values[1]);
	else if (values.length === 3) gl.vertexAttrib3f(location, values[0], values[1], values[2]);
	else if (values.length === 4) gl.vertexAttrib4f(location, values[0], values[1], values[2], values[3]);
}

/**
 * Uploads one createGrassFieldMesh artifact into GPU buffers.
 * @param {WebGLRenderingContext} gl Game GL context.
 * @param {object} fieldMesh createGrassFieldMesh output.
 * @param {object} [options={}] { tints: Float32Array, program }
 * @returns {object} Binding with render() and dispose().
 */
export function createMeadowGrassGlBinding(gl, fieldMesh, options = {}) {
	if (!gl || !fieldMesh || !fieldMesh.instanceCount) return null;
	const program = options.program || createMeadowGrassGlProgram(gl);
	const ownsProgram = !options.program;
	const webgl2 = typeof gl.drawElementsInstanced === 'function';
	const angleExt = !webgl2 ? gl.getExtension('ANGLE_instanced_arrays') : null;
	const instanced = webgl2 ? 'webgl2' : (angleExt ? { ext: angleExt, draw: 'angle' } : null);

	const positions = toFloat32(fieldMesh.positions);
	const indices = toIndexArray(fieldMesh.indices);
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

	const instanceCount = fieldMesh.instanceCount;
	const tints = options.tints && options.tints.length >= instanceCount * 3
		? options.tints
		: whiteTints(instanceCount);
	const instanceBuffers = {
		offset: uploadInstances(gl, fieldMesh.instanceOffsets, 3),
		scale: uploadInstances(gl, fieldMesh.instanceScales, 1),
		rotation: uploadInstances(gl, fieldMesh.instanceRotations, 1),
		bend: uploadInstances(gl, fieldMesh.instanceBends, 1),
		windPhase: uploadInstances(gl, fieldMesh.instanceWindPhases, 1),
		tint: uploadInstances(gl, tints, 3)
	};

	let merged = null;
	if (!instanced) {
		merged = buildMergedFallback(fieldMesh, positions, indices, tints);
		merged.positionBuffer = uploadStaticBuffer(gl, merged.positions);
		merged.windPhaseBuffer = uploadStaticBuffer(gl, merged.windPhase);
		merged.tintBuffer = uploadStaticBuffer(gl, merged.tints);
		merged.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, merged.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, merged.indices, gl.STATIC_DRAW);
		merged.indexType = merged.indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
	}

	const binding = {
		program,
		instanceCount,
		indexCount: indices.length,
		indexGlType: indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT,
		instanced: instanced ? (webgl2 ? 'webgl2' : 'angle') : 'merged',
		/**
		 * Draws the field. uniforms: { projectionMatrix, viewMatrix, timeSeconds,
		 * wind, timeOfDay, interactors: [{x,y,z,radius}] }.
		 */
		render(uniforms = {}) {
			drawGrassField(gl, binding, instanceBuffers, positionBuffer, indexBuffer, merged, uniforms);
		},
		dispose() {
			for (const buffer of Object.values(instanceBuffers)) {
				try { gl.deleteBuffer(buffer); } catch {}
			}
			try { gl.deleteBuffer(positionBuffer); } catch {}
			try { gl.deleteBuffer(indexBuffer); } catch {}
			if (merged) {
				for (const buffer of [merged.positionBuffer, merged.windPhaseBuffer, merged.tintBuffer, merged.indexBuffer]) {
					try { gl.deleteBuffer(buffer); } catch {}
				}
			}
			if (ownsProgram) program.dispose();
		}
	};
	return binding;
}

function drawGrassField(gl, binding, instanceBuffers, positionBuffer, indexBuffer, merged, uniforms) {
	const { program } = binding;
	const time = Number(uniforms.timeSeconds) || 0;
	const wind = { ...MEADOW_WIND_DEFAULT, ...(uniforms.wind || {}) };
	const light = MEADOW_GRASS_LIGHT[uniforms.timeOfDay] || MEADOW_GRASS_LIGHT.day;
	const gust = sampleMeadowGust(time) * (uniforms.gustScale ?? 1);

	const previousProgram = gl.getParameter(gl.CURRENT_PROGRAM);
	const previousDepthTest = gl.getParameter(gl.DEPTH_TEST);
	const previousBlend = gl.getParameter(gl.BLEND);
	const previousCull = gl.getParameter(gl.CULL_FACE);
	gl.useProgram(program.program);
	gl.enable(gl.DEPTH_TEST);
	gl.disable(gl.BLEND);
	gl.disable(gl.CULL_FACE);

	const U = program.uniforms;
	setMat4(gl, U.projectionMatrix, uniforms.projectionMatrix);
	setMat4(gl, U.modelViewMatrix, uniforms.viewMatrix);
	if (U.time) gl.uniform1f(U.time, time);
	if (U.windVector) gl.uniform3f(U.windVector, wind.direction[0], wind.direction[1], wind.direction[2]);
	if (U.windStrength) gl.uniform1f(U.windStrength, wind.baseStrength * gust);
	if (U.turbulence) gl.uniform1f(U.turbulence, wind.turbulence);
	if (U.wetness) gl.uniform1f(U.wetness, wind.wetness);
	if (U.recovery) gl.uniform1f(U.recovery, wind.recovery);
	if (U.tintStrength) gl.uniform1f(U.tintStrength, 1);
	if (U.ambientLightColor) gl.uniform3f(U.ambientLightColor, ...light.ambient);
	if (U.directionalLightColor) gl.uniform3f(U.directionalLightColor, ...light.directional);
	if (U.lightDirection) gl.uniform3f(U.lightDirection, ...light.direction);
	setInteractors(gl, U, uniforms.interactors);

	const A = program.attributes;
	if (binding.instanced === 'merged' && merged) {
		drawMergedFallback(gl, binding, merged, A);
	} else {
		const divisorMode = binding.instanced === 'webgl2' ? 'webgl2' : 'angle';
		bindAttribute(gl, A.position, positionBuffer, 3, null);
		bindAttribute(gl, A.offset, instanceBuffers.offset, 3, divisorMode);
		bindAttribute(gl, A.scale, instanceBuffers.scale, 1, divisorMode);
		bindAttribute(gl, A.rotation, instanceBuffers.rotation, 1, divisorMode);
		bindAttribute(gl, A.bend, instanceBuffers.bend, 1, divisorMode);
		bindAttribute(gl, A.windPhase, instanceBuffers.windPhase, 1, divisorMode);
		bindAttribute(gl, A.tint, instanceBuffers.tint, 3, divisorMode);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		if (binding.instanced === 'webgl2') {
			gl.drawElementsInstanced(gl.TRIANGLES, binding.indexCount, binding.indexGlType, 0, binding.instanceCount);
		} else {
			gl.getExtension('ANGLE_instanced_arrays')
				.drawElementsInstancedANGLE(gl.TRIANGLES, binding.indexCount, binding.indexGlType, 0, binding.instanceCount);
		}
		resetDivisors(gl, binding, A);
	}

	for (const location of Object.values(A)) {
		if (location >= 0) {
			try { gl.disableVertexAttribArray(location); } catch {}
		}
	}
	if (previousProgram) gl.useProgram(previousProgram);
	if (!previousDepthTest) gl.disable(gl.DEPTH_TEST);
	if (previousBlend) gl.enable(gl.BLEND);
	if (previousCull) gl.enable(gl.CULL_FACE);
}

/**
 * Merged fallback draw: positions carry baked offset/rotation/scale, so the
 * remaining instance attributes become constants (or per-vertex wind/tint).
 * Wind sway keeps working through per-vertex wind phase.
 */
function drawMergedFallback(gl, binding, merged, A) {
	bindAttribute(gl, A.position, merged.positionBuffer, 3, null);
	bindAttribute(gl, A.windPhase, merged.windPhaseBuffer, 1, null);
	bindAttribute(gl, A.tint, merged.tintBuffer, 3, null);
	setConstantAttribute(gl, A.offset, [0, 0, 0]);
	setConstantAttribute(gl, A.scale, [1]);
	setConstantAttribute(gl, A.rotation, [0]);
	setConstantAttribute(gl, A.bend, [0]);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, merged.indexBuffer);
	gl.drawElements(gl.TRIANGLES, merged.indexCount, merged.indexType, 0);
}

function resetDivisors(gl, binding, attributes) {
	const keys = ['offset', 'scale', 'rotation', 'bend', 'windPhase', 'tint'];
	if (binding.instanced === 'webgl2') {
		for (const key of keys) {
			const location = attributes[key];
			if (location >= 0) gl.vertexAttribDivisor(location, 0);
		}
	} else if (binding.instanced === 'angle') {
		const ext = gl.getExtension('ANGLE_instanced_arrays');
		for (const key of keys) {
			const location = attributes[key];
			if (location >= 0) ext.vertexAttribDivisorANGLE(location, 0);
		}
	}
}

function setInteractors(gl, U, interactors) {
	const list = Array.isArray(interactors) ? interactors.slice(0, MAX_INTERACTORS) : [];
	if (U.interactorCount) gl.uniform1i(U.interactorCount, list.length);
	if (U.interactors) {
		const flat = new Float32Array(MAX_INTERACTORS * 3);
		for (let index = 0; index < list.length; index += 1) {
			flat[index * 3] = Number(list[index]?.x ?? list[index]?.[0] ?? 0);
			flat[index * 3 + 1] = Number(list[index]?.y ?? list[index]?.[1] ?? 0);
			flat[index * 3 + 2] = Number(list[index]?.z ?? list[index]?.[2] ?? 0);
		}
		gl.uniform3fv(U.interactors, flat);
	}
	if (U.interactorRadius) {
		const radii = new Float32Array(MAX_INTERACTORS).fill(1.2);
		for (let index = 0; index < list.length; index += 1) {
			radii[index] = Math.max(0.2, Number(list[index]?.radius ?? 1.2));
		}
		gl.uniform1fv(U.interactorRadius, radii);
	}
}

function setMat4(gl, location, matrix) {
	if (location == null || location < 0) return;
	if (matrix && matrix.length >= 16) {
		gl.uniformMatrix4fv(location, false, matrix);
	}
}

function uploadInstances(gl, values, size) {
	return uploadStaticBuffer(gl, toFloat32(values));
}

function uploadStaticBuffer(gl, typedArray) {
	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, typedArray, gl.STATIC_DRAW);
	return buffer;
}

function toFloat32(values) {
	if (values instanceof Float32Array) return values;
	return new Float32Array(values || []);
}

function toIndexArray(values) {
	const list = values || [];
	let maximum = 0;
	for (const value of list) if (value > maximum) maximum = value;
	return maximum > 65535 ? new Uint32Array(list) : new Uint16Array(list);
}

function whiteTints(count) {
	const tints = new Float32Array(count * 3);
	tints.fill(1);
	return tints;
}

/**
 * CPU-expanded fallback when neither WebGL2 nor ANGLE instancing exists:
 * bakes offset/rotation/scale into positions and repeats wind phase + tint
 * per vertex so the same program draws with divisor-free attributes.
 */
function buildMergedFallback(fieldMesh, positions, indices, tints) {
	const bladeVertexCount = positions.length / 3;
	const instanceCount = fieldMesh.instanceCount;
	const mergedPositions = new Float32Array(bladeVertexCount * instanceCount * 3);
	const mergedWindPhase = new Float32Array(bladeVertexCount * instanceCount);
	const mergedTints = new Float32Array(bladeVertexCount * instanceCount * 3);
	const mergedIndex = new (indices instanceof Uint32Array ? Uint32Array : Uint16Array)(indices.length * instanceCount);
	const offsets = fieldMesh.instanceOffsets;
	const scales = fieldMesh.instanceScales;
	const rotations = fieldMesh.instanceRotations;
	const windPhases = fieldMesh.instanceWindPhases;
	for (let instance = 0; instance < instanceCount; instance += 1) {
		const scale = scales[instance] || 1;
		const rotation = rotations[instance] || 0;
		const cosine = Math.cos(rotation);
		const sine = Math.sin(rotation);
		const ox = offsets[instance * 3] || 0;
		const oy = offsets[instance * 3 + 1] || 0;
		const oz = offsets[instance * 3 + 2] || 0;
		const vertexBase = instance * bladeVertexCount;
		for (let vertex = 0; vertex < bladeVertexCount; vertex += 1) {
			const sx = positions[vertex * 3] * scale;
			const sy = positions[vertex * 3 + 1] * scale;
			const sz = positions[vertex * 3 + 2] * scale;
			mergedPositions[(vertexBase + vertex) * 3] = sx * cosine - sz * sine + ox;
			mergedPositions[(vertexBase + vertex) * 3 + 1] = sy + oy;
			mergedPositions[(vertexBase + vertex) * 3 + 2] = sx * sine + sz * cosine + oz;
			mergedWindPhase[vertexBase + vertex] = windPhases[instance] || 0;
			mergedTints[(vertexBase + vertex) * 3] = tints[instance * 3];
			mergedTints[(vertexBase + vertex) * 3 + 1] = tints[instance * 3 + 1];
			mergedTints[(vertexBase + vertex) * 3 + 2] = tints[instance * 3 + 2];
		}
		for (let index = 0; index < indices.length; index += 1) {
			mergedIndex[instance * indices.length + index] = indices[index] + vertexBase;
		}
	}
	return {
		positions: mergedPositions,
		windPhase: mergedWindPhase,
		tints: mergedTints,
		indices: mergedIndex,
		positionBuffer: null,
		windPhaseBuffer: null,
		tintBuffer: null,
		indexBuffer: null,
		indexCount: mergedIndex.length,
		indexType: null
	};
}
