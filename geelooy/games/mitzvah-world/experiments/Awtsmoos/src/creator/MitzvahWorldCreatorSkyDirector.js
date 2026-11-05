// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorSkyDirector.js
 * @description Lets universe creators direct their own sky. Yaakov 2026-10-11:
 * the sky is part of the universe the player creates. Wraps the reality engine's
 * atmosphere presets with creator-document recording, so a universe saves, remixes,
 * and reopens under the same heaven it was authored in.
 */

import { createRealityEngine, realityPresetIds } from '../render/RealityEngine.js';
import { universeSkyPresets } from './MitzvahWorldUniverseCatalog.js';

/** Creates one sky director bound to a renderer (or duck-typed setEnvironment target). */
export function createSkyDirector(options = {}) {
	const engine = createRealityEngine({ renderer: options.renderer, environmentTarget: options.environmentTarget });
	const record = options.record || null;
	let current = options.skyId && realityPresetIds().includes(options.skyId) ? options.skyId : 'morning';

	function setSky(skyId) {
		if (!realityPresetIds().includes(skyId)) throw new Error(`SKY_UNKNOWN:${skyId}`);
		const receipt = engine.applyPreset(skyId);
		current = skyId;
		if (record && typeof record === 'function') {
			try { record({ kind: 'sky', skyId, at: Date.now() }); } catch { /* record is best-effort */ }
		}
		return receipt;
	}

	function skyId() {
		return current;
	}

	function describe() {
		const preset = universeSkyPresets().find(item => item.id === current) || { id: current, label: current };
		return Object.freeze({ id: preset.id, label: preset.label, engine: engine.describe() });
	}

	return Object.freeze({ describe, setSky, skyId });
}

export default createSkyDirector;
