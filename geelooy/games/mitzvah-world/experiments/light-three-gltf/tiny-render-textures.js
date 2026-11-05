// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-textures.js
 * @description Binds base, mix, ecological textures, and terrain-quality vectors with residency evidence.
 * The Awtsmoos remains one through every material garment; Awtsmoos.com sends warp, distance,
 * wetness, chroma, and six source images to the GPU without repeated uploads or hidden silence.
 */

import { GpuTextureCache } from './tiny-gpu-texture-cache.js';
import { LayeredTextureBinder } from './tiny-layered-texture-binder.js';
import { addMapStats, addMixStats } from './tiny-render-texture-stats.js';
import { sameTextureState, textureState } from './tiny-texture-state.js';

export class MaterialTextureBinder {
	constructor(gl) {
		this.gl = gl;
		this.gpu = new GpuTextureCache(gl);
		this.layers = new LayeredTextureBinder(this.gpu);
		this.previous = null;
		this.skips = 0;
		this.uploads = 0;
	}

	invalidate() {
		this.previous = null;
	}

	bind(locations, material = {}, stats) {
		const state = textureState(material);
		if (state.mapReady) addMapStats(material, stats);
		if (state.mixReady) addMixStats(material, stats);
		if (sameTextureState(this.previous, state)) {
			this.skips += 1;
			stats.textureStateSkips = (stats.textureStateSkips || 0) + 1;
			return;
		}
		this.previous = state;
		this.uploads += 1;
		stats.textureStateUploads = (stats.textureStateUploads || 0) + 1;
		this.bindMap(locations, material, state);
		this.bindMix(locations, material, state);
		this.bindTerrainMixing(locations, state);
		this.layers.bind(locations, material, state.layers, stats);
	}

	bindMap(locations, material, state) {
		const texture = state.mapReady
			? this.gpu.textureFor(state.mapImage, material)
			: this.gpu.defaultTexture;
		this.gpu.bind(1, locations.map, texture);
		this.gl.uniform1i(locations.useMap, state.mapReady ? 1 : 0);
		this.gl.uniform2f(locations.mapRepeat, state.mapRepeat0, state.mapRepeat1);
	}

	bindMix(locations, material, state) {
		const texture = state.mixReady
			? this.gpu.textureFor(state.mixImage, material)
			: this.gpu.defaultTexture;
		this.gpu.bind(2, locations.mixMap, texture);
		this.gl.uniform1i(locations.useMixMap, state.mixReady ? 1 : 0);
		this.gl.uniform2f(locations.mixRepeat, state.mixRepeat0, state.mixRepeat1);
		this.gl.uniform1f(locations.mixStrength, state.mixStrength);
		if (locations.mixPatchScale) this.gl.uniform1f(locations.mixPatchScale, state.patchScale);
		if (locations.mixPatchSharpness) {
			this.gl.uniform1f(locations.mixPatchSharpness, state.patchSharpness);
		}
	}

	bindTerrainMixing(locations, state) {
		const mixing = state.terrainMixing;
		if (locations.terrainMixingA) this.gl.uniform4fv(locations.terrainMixingA, mixing.a);
		if (locations.terrainMixingB) this.gl.uniform4fv(locations.terrainMixingB, mixing.b);
		if (locations.terrainMixingC) this.gl.uniform4fv(locations.terrainMixingC, mixing.c);
	}

	diagnostics() {
		return {
			gpu: this.gpu.diagnostics(),
			layerCapacity: this.layers.layerCapacity,
			layerUnits: [...this.layers.layerUnits],
			stateSkips: this.skips,
			stateUploads: this.uploads
		};
	}
}
