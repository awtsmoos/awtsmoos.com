// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityEngine.js
 * @description The MitzvahWorld reality engine: cinematic environment presets and quality tiers
 * over the tiny WebGL renderer. Yaakov 2026-10-11: the engine must render hyperrealistic
 * quality, and every universe (authored or player-created) reads one atmosphere truth.
 * Presets drive sun, fog, ambient and exposure through the renderer's setEnvironment;
 * quality tiers drive the real shadow-map budget through the renderer's setShadowTier
 * doorway (2048/1024/512 texels, or off), and report pixelRatioCap/grassScale/
 * particleScale through describe() and the onQuality hook for the app to apply.
 */

const REALITY_PRESETS = Object.freeze({
	dawn: Object.freeze({
		label: 'Dawn',
		ambient: [0.22, 0.20, 0.24],
		exposure: 1.02,
		fogColor: [0.72, 0.58, 0.52],
		fogFar: 520,
		fogNear: 120,
		sunColor: [1.45, 0.82, 0.52],
		sunDirection: [-0.78, 0.28, 0.42]
	}),
	morning: Object.freeze({
		label: 'Morning',
		ambient: [0.21, 0.23, 0.26],
		exposure: 1.04,
		fogColor: [0.58, 0.68, 0.74],
		fogFar: 560,
		fogNear: 145,
		sunColor: [1.30, 1.02, 0.78],
		sunDirection: [-0.62, 0.55, 0.44]
	}),
	noon: Object.freeze({
		label: 'Noon',
		ambient: [0.24, 0.25, 0.27],
		exposure: 1.00,
		fogColor: [0.52, 0.66, 0.74],
		fogFar: 640,
		fogNear: 170,
		sunColor: [1.22, 1.10, 0.98],
		sunDirection: [-0.30, 0.90, 0.32]
	}),
	golden: Object.freeze({
		label: 'Golden hour',
		ambient: [0.22, 0.19, 0.20],
		exposure: 1.08,
		fogColor: [0.78, 0.60, 0.44],
		fogFar: 500,
		fogNear: 110,
		sunColor: [1.52, 0.88, 0.48],
		sunDirection: [-0.85, 0.30, 0.30]
	}),
	dusk: Object.freeze({
		label: 'Dusk',
		ambient: [0.18, 0.17, 0.24],
		exposure: 1.00,
		fogColor: [0.52, 0.38, 0.48],
		fogFar: 460,
		fogNear: 100,
		sunColor: [1.30, 0.62, 0.42],
		sunDirection: [-0.88, 0.16, 0.28]
	}),
	night: Object.freeze({
		label: 'Night',
		ambient: [0.10, 0.12, 0.18],
		exposure: 0.94,
		fogColor: [0.10, 0.14, 0.24],
		fogFar: 420,
		fogNear: 90,
		sunColor: [0.42, 0.55, 0.85],
		sunDirection: [-0.40, 0.62, 0.50]
	}),
	storm: Object.freeze({
		label: 'Storm',
		ambient: [0.16, 0.17, 0.19],
		exposure: 0.92,
		fogColor: [0.38, 0.42, 0.46],
		fogFar: 340,
		fogNear: 70,
		sunColor: [0.85, 0.88, 0.95],
		sunDirection: [-0.50, 0.45, 0.40]
	})
});

const QUALITY_TIERS = Object.freeze({
	cinematic: Object.freeze({ label: 'Cinematic', pixelRatioCap: 2.0, grassScale: 1.0, particleScale: 1.0, shadowTier: 'near' }),
	balanced: Object.freeze({ label: 'Balanced', pixelRatioCap: 1.5, grassScale: 0.7, particleScale: 0.7, shadowTier: 'near' }),
	performance: Object.freeze({ label: 'Performance', pixelRatioCap: 1.0, grassScale: 0.4, particleScale: 0.4, shadowTier: 'far' })
});

/** Lists the stable reality preset ids in presentation order. */
export function realityPresetIds() {
	return Object.keys(REALITY_PRESETS);
}

/** Returns one frozen reality preset by id, or throws a deterministic domain error. */
export function realityPreset(id) {
	const preset = REALITY_PRESETS[id];
	if (!preset) throw new Error(`REALITY_PRESET_UNKNOWN:${id}`);
	return preset;
}

/** Lists the stable quality tier ids. */
export function realityQualityIds() {
	return Object.keys(QUALITY_TIERS);
}

/**
 * Creates one reality-engine controller bound to a tiny renderer (or a duck-typed
 * { setEnvironment } target). Never touches the DOM; safe to construct in tests.
 *
 * Quality tiers drive REAL systems: the shadow tier is applied to the bound
 * renderer through its setShadowTier doorway (2048/1024/512/off texel budgets),
 * while pixelRatioCap/grassScale/particleScale are reported through describe()
 * and the onQuality hook so the embedding app applies them to its canvas and
 * vegetation budgets.
 */
export function createRealityEngine(options = {}) {
	const renderer = options.renderer || null;
	const shadowBudgets = options.shadowBudget || null;
	const state = {
		presetId: options.presetId || 'morning',
		qualityId: options.qualityId || 'balanced',
		appliedAt: 0
	};

	function target() {
		return renderer || options.environmentTarget || null;
	}

	function applyPreset(presetId) {
		const preset = realityPreset(presetId);
		const environment = target();
		if (environment && typeof environment.setEnvironment === 'function') {
			environment.setEnvironment({
				ambient: [...preset.ambient],
				exposure: preset.exposure,
				fogColor: [...preset.fogColor],
				fogFar: preset.fogFar,
				fogNear: preset.fogNear,
				sunColor: [...preset.sunColor],
				sunDirection: [...preset.sunDirection]
			});
		}
		state.presetId = presetId;
		state.appliedAt = Date.now();
		return Object.freeze({ ...state, label: preset.label });
	}

	function setQuality(qualityId) {
		const tier = QUALITY_TIERS[qualityId];
		if (!tier) throw new Error(`REALITY_QUALITY_UNKNOWN:${qualityId}`);
		state.qualityId = qualityId;
		applyShadowTier(tier.shadowTier);
		if (typeof options.onQuality === 'function') options.onQuality(qualityId, tier);
		return Object.freeze({ qualityId, ...tier });
	}

	/** Applies the shadow tier through the budget controller or the renderer directly. */
	function applyShadowTier(tierName) {
		const renderTarget = target();
		if (!renderTarget) return false;
		if (shadowBudgets && typeof shadowBudgets.applyTier === 'function') {
			return shadowBudgets.applyTier(tierName, renderTarget);
		}
		if (typeof renderTarget.setShadowTier === 'function') {
			return renderTarget.setShadowTier(tierName) !== false;
		}
		return false;
	}

	function describe() {
		const preset = REALITY_PRESETS[state.presetId];
		const tier = QUALITY_TIERS[state.qualityId];
		return Object.freeze({
			presetId: state.presetId,
			presetLabel: preset.label,
			qualityId: state.qualityId,
			qualityLabel: tier.label,
			pixelRatioCap: tier.pixelRatioCap,
			grassScale: tier.grassScale,
			particleScale: tier.particleScale,
			shadowTier: tier.shadowTier,
			appliedAt: state.appliedAt
		});
	}

	return Object.freeze({ applyPreset, describe, setQuality, state: () => Object.freeze({ ...state }) });
}

export default createRealityEngine;
