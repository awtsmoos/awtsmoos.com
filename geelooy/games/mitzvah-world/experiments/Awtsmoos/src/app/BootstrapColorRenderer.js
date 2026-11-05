//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file BootstrapColorRenderer.js
 * @description Draws the bounded survival world together with the real authored Chossid before any rich renderer exists.
 * The Awtsmoos lets earth and traveler appear in the same first light; Awtsmoos.com keeps the low-mode renderer tiny
 * while refusing to filter the canonical Chossid out merely because he is authored reality rather than bootstrap scenery.
 * The renderer also paints the procedural sky dome first, binds generated ground textures,
 * settles distance fog into the horizon, and breathes fireflies, embers, and seeds through one particle layer.
 */

import { lookAt, perspective } from '../../../light-three-gltf/tiny-camera-math.js';
import { multiply } from '../../../light-three-gltf/tiny-matrix-core.js';
import {
	bindBootstrapMeshColor,
	writeBootstrapMaterialColor
} from './BootstrapColorBinding.js';
import { createBootstrapColorProgram } from './BootstrapColorProgram.js';
import { BootstrapMeshBufferCache } from './BootstrapMeshBufferCache.js';
import { bootstrapSkyPalette, createBootstrapSky } from './BootstrapSkyDome.js';
import { createMitzvahParticleLayer } from './fx/MitzvahParticleLayer.js';
import { renderMeadowProceduralLayer } from './BootstrapMeadowProceduralLayer.js';

export class BootstrapColorRenderer {
	constructor(gl, stats) {
		this.gl = gl;
		this.stats = stats;
		this.buffers = new BootstrapMeshBufferCache(gl);
		this.materialColor = new Float32Array(4);
		this.programState = null;
		this.textureCache = new WeakMap();
		this.sky = null;
		this.particles = null;
		this.lastParticleSeconds = null;
	}

	render(scene, camera, clearColor) {
		clear(this.gl, clearColor);
		const meshes = collectBootstrapMeshes(scene);
		this.beginStats(meshes.length);
		const projectionView = camera ? cameraProjectionView(camera) : null;
		const skyEnv = readSkyEnv(scene);
		this.sky ||= createBootstrapSky(this.gl);
		if (projectionView) {
			this.sky.render(camera, projectionView, skyEnv.timeOfDay, skyEnv.timeSeconds);
			this.stats.draws += 1;
		}
		if (!meshes.length || !camera) return;
		this.programState ||= createBootstrapColorProgram(this.gl);
		scene.updateWorldMatrix?.();
		const { locations, program } = this.programState;
		this.gl.useProgram(program);
		this.gl.uniformMatrix4fv(
			locations.projectionView,
			false,
			projectionView
		);
		applyAtmosphere(this.gl, locations, camera, skyEnv);
		this.gl.enableVertexAttribArray(locations.position);
		for (const mesh of meshes) this.drawMesh(mesh, locations);
		this.renderParticles(scene, projectionView, skyEnv);
		this.renderMeadowVegetation(scene, camera, projectionView, skyEnv);
	}

	drawMesh(mesh, locations) {
		const entry = this.buffers.resolve(mesh.geometry);
		if (!entry) return;
		const gl = this.gl;
		gl.bindBuffer(gl.ARRAY_BUFFER, entry.positionBuffer);
		gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, 0, 0);
		bindBootstrapMeshColor(this.buffers, gl, entry, locations, mesh.material);
		this.buffers.bindUv(entry, locations.texCoord);
		bindBootstrapMaterialTexture(gl, this.textureCache, locations, mesh.material);
		gl.uniformMatrix4fv(locations.model, false, mesh.matrixWorld);
		gl.uniform4fv(locations.color, writeBootstrapMaterialColor(mesh.material, this.materialColor));
		if (entry.indexBuffer) {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, entry.indexBuffer);
			gl.drawElements(gl.TRIANGLES, entry.count, entry.indexType, 0);
		} else {
			gl.drawArrays(gl.TRIANGLES, 0, entry.count);
		}
		this.stats.draws += 1;
		this.stats.triangles += Math.floor(entry.count / 3);
	}

	renderParticles(scene, projectionView, skyEnv) {
		this.particles ||= createMitzvahParticleLayer(this.gl);
		const nowSeconds = skyEnv.timeSeconds;
		const delta = this.lastParticleSeconds == null
			? 0.016
			: Math.min(0.1, Math.max(0, nowSeconds - this.lastParticleSeconds));
		this.lastParticleSeconds = nowSeconds;
		this.particles.update(delta, {
			emitters: scene?.userData?.particleEmitters || [],
			timeOfDay: skyEnv.timeOfDay,
			timeSeconds: nowSeconds
		});
		this.particles.render(projectionView);
		this.stats.draws += 1;
	}

	/**
	 * Draws the procedural vegetation layer (instanced grass, ambient particle
	 * fields) through the real procedural core. Fully guarded: any failure is
	 * swallowed so the sibling-owned frame can never break.
	 */
	renderMeadowVegetation(scene, camera, projectionView, skyEnv) {
		try {
			renderMeadowProceduralLayer(this.gl, scene, camera, projectionView, skyEnv, this.stats);
		} catch {}
	}

	beginStats(meshCount) {
		this.stats.frames += 1;
		this.stats.draws = 0;
		this.stats.triangles = 0;
		this.stats.meshes = meshCount;
	}

	dispose() {
		if (this.programState?.program) this.gl.deleteProgram(this.programState.program);
		this.programState = null;
		this.sky?.dispose?.();
		this.sky = null;
		this.particles?.dispose?.();
		this.particles = null;
		this.textureCache = new WeakMap();
	}
}

/** Reads time-of-day and clock from the scene; defaults keep noon light. */
function readSkyEnv(scene) {
	const env = scene?.userData?.bootstrapSky || {};
	const timeOfDay = env.timeOfDay === 'night' || env.timeOfDay === 'sunrise' ? env.timeOfDay : 'day';
	return {
		timeOfDay,
		timeSeconds: Number.isFinite(env.timeSeconds)
			? env.timeSeconds
			: (typeof performance !== 'undefined' ? performance.now() / 1000 : 0)
	};
}

/** Feeds camera position and palette fog into the terrain program. */
function applyAtmosphere(gl, locations, camera, skyEnv) {
	const palette = bootstrapSkyPalette(skyEnv.timeOfDay);
	const position = camera.position;
	const x = Array.isArray(position) ? position[0] : position.x || 0;
	const y = Array.isArray(position) ? position[1] : position.y || 0;
	const z = Array.isArray(position) ? position[2] : position.z || 0;
	if (locations.cameraPos) gl.uniform3f(locations.cameraPos, x, y, z);
	if (locations.fogColor) gl.uniform3f(locations.fogColor, ...palette.fogColor);
	if (locations.fogDensity) gl.uniform1f(locations.fogDensity, palette.fogDensity);
}

/** Binds a material's generated texture field (or disables sampling when absent). */
function bindBootstrapMaterialTexture(gl, cache, locations, materialValue) {
	const material = Array.isArray(materialValue) ? materialValue[0] : materialValue;
	// B"H: prefer the remote mapImage; fall back to the procedural texture field
	// when the remote image is absent so houses never render as flat color.
	const image = material?.mapImage || material?.proceduralMapImage;
	const repeat = material?.mapRepeat || [1, 1];
	if (!image || !Number.isFinite(image.width) || !Number.isFinite(image.height)) {
		if (locations.useMap) gl.uniform1f(locations.useMap, 0);
		return;
	}
	let texture = cache.get(material);
	if (!texture) {
		texture = uploadTexture(gl, image);
		if (texture) cache.set(material, texture);
	}
	if (!texture) {
		if (locations.useMap) gl.uniform1f(locations.useMap, 0);
		return;
	}
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	if (locations.map) gl.uniform1i(locations.map, 0);
	if (locations.mapRepeat) gl.uniform2f(locations.mapRepeat, repeat[0] || 1, repeat[1] || 1);
	if (locations.useMap) gl.uniform1f(locations.useMap, 1);
}

function uploadTexture(gl, image) {
	try {
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		if (image.data instanceof Uint8Array || image.data instanceof Uint8ClampedArray) {
			gl.texImage2D(
				gl.TEXTURE_2D, 0, gl.RGBA,
				image.width, image.height, 0,
				gl.RGBA, gl.UNSIGNED_BYTE, image.data
			);
		} else {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		}
		gl.generateMipmap(gl.TEXTURE_2D);
		return texture;
	} catch (error) {
		return null;
	}
}

/** Collects only intentional survival visuals: bounded world geometry and the canonical authored Chossid. */
export function collectBootstrapMeshes(scene) {
	const meshes = [];
	scene?.traverse?.(object => {
		if (bootstrapRenderable(object)) meshes.push(object);
	});
	return meshes;
}

function bootstrapRenderable(object) {
	const isMesh = object?.isMesh || object?.isSkinnedMesh;
	const intended = object?.userData?.bootstrapVisual || object?.userData?.realChossid;
	return Boolean(isMesh && object.visible !== false && intended);
}

function cameraProjectionView(camera) {
	return multiply(
		perspective(camera.fov, camera.aspect, camera.near, camera.far),
		lookAt(camera.position.toArray(), camera.target || [0, 1, 0])
	);
}

function clear(gl, color) {
	gl.clearColor(color[0], color[1], color[2], color[3]);
	gl.clearDepth(1);
	gl.enable(gl.DEPTH_TEST);
	gl.disable(gl.CULL_FACE);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
