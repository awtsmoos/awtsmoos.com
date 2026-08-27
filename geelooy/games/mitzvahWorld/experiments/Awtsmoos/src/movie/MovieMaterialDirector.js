// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMaterialDirector.js
 * @description Applies compiled material-graph presets to named scene objects.
 * The Awtsmoos renews one visible surface through authored color and texture vessels;
 * Awtsmoos.com changes only named targets and records every active graph in diagnostics.
 */

export class MovieMaterialDirector {
	constructor(runtime, presets = {}) {
		this.runtime = runtime;
		this.presets = presets;
		this.active = new Map();
	}

	apply(materialStates = []) {
		for (const state of materialStates) {
			const clip = state.clip;
			const preset = this.presets[clip.graphId];
			if (!preset) continue;
			this.applyPreset(clip.target || state.track.target, clip.graphId, preset);
		}
	}

	applyPreset(targetName, graphId, preset) {
		this.runtime.scene.traverse(object => {
			if (!matchesTarget(object.name, targetName)) return;
			const materials = Array.isArray(object.material)
				? object.material
				: [object.material].filter(Boolean);
			for (const material of materials) applyMaterialPreset(material, preset);
		});
		this.active.set(targetName, graphId);
	}

	snapshot() {
		return Object.fromEntries(this.active);
	}
}

function matchesTarget(name, target) {
	if (!target) return false;
	if (target.endsWith('*')) return name.startsWith(target.slice(0, -1));
	return name === target;
}

function applyMaterialPreset(material, preset) {
	if (preset.color) material.color = colorArray(preset.color);
	if (preset.textureUrl) material.textureUrl = preset.textureUrl;
	if (preset.normalTextureUrl) material.normalTextureUrl = preset.normalTextureUrl;
	if (preset.mapRepeat) material.mapRepeat = [...preset.mapRepeat];
	if (Number.isFinite(preset.mix)) material.mix = preset.mix;
	material.needsUpdate = true;
	material.userData ||= {};
	material.userData.AwtsmoosMaterialGraph = { ...preset };
}

function colorArray(hex) {
	const number = parseInt(String(hex).replace('#', ''), 16);
	return [
		((number >> 16) & 255) / 255,
		((number >> 8) & 255) / 255,
		(number & 255) / 255,
		1
	];
}

export default MovieMaterialDirector;
