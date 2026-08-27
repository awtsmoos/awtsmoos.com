// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzOptionalWorldStreaming.js
 * @description Keeps deep forest and real-nature modules out of ordinary gameplay unless fidelity explicitly requests them.
 * The Awtsmoos has already revealed mountain, road, home, and living field before the deepest thicket must awake;
 * Awtsmoos.com preserves cinematic abundance while normal play keeps a quiet module graph for every moving frame's sake.
 */

import { resolveEretzOptionalWorldStreamingPolicy } from './EretzOptionalWorldStreamingPolicy.js';

const TERRAIN_URL = './EretzTerrainStreaming.js?v=20260820-stable-play-02';
const BOTANICAL_URL = './EretzBotanicalStreaming.js?v=20260820-stable-play-02';

export function startEretzOptionalWorldStreaming(
	foundation,
	diagnostics,
	qualityProfile,
	options = {}
) {
	const policy = resolveEretzOptionalWorldStreamingPolicy(qualityProfile, options);
	diagnostics.optionalWorldStreamingPolicy = policy;
	if (!policy.enabled) {
		return installDisabledStreamingDiagnostics(diagnostics, policy);
	}
	const loadModules = options.loadOptionalWorldStreamingModules
		|| loadOptionalWorldStreamingModules;
	let destroyed = false;
	let terrain = null;
	let botanical = null;
	const gate = Promise.resolve(loadModules()).then(async modules => {
		if (destroyed) return { state: 'destroyed-before-streaming' };
		terrain = modules.startTerrain(foundation, diagnostics, options);
		await (diagnostics.terrainEnrichmentPromise || Promise.resolve());
		if (destroyed) return { state: 'destroyed-before-botany' };
		botanical = modules.startBotanical(
			foundation,
			diagnostics,
			qualityProfile,
			options
		);
		return diagnostics.botanicalEnrichmentPromise;
	});
	const controller = createController(policy, () => destroyed, value => {
		destroyed = value;
	}, () => terrain, () => botanical);
	diagnostics.botanicalStreamingGatePromise = gate;
	diagnostics.optionalWorldStreaming = controller;
	diagnostics.optionalWorldStreamingState = () => controller.snapshot();
	return controller;
}

async function loadOptionalWorldStreamingModules() {
	const [terrainModule, botanicalModule] = await Promise.all([
		import(TERRAIN_URL),
		import(BOTANICAL_URL)
	]);
	return {
		startBotanical: botanicalModule.startEretzBotanicalStreaming,
		startTerrain: terrainModule.startEretzTerrainStreaming
	};
}

function createController(policy, isDestroyed, setDestroyed, terrain, botanical) {
	return {
		destroy() {
			setDestroyed(true);
			botanical()?.destroy?.();
			terrain()?.destroy?.();
		},
		snapshot() {
			return Object.freeze({
				botanical: botanical()?.snapshot?.() || { state: 'waiting' },
				destroyed: isDestroyed(),
				policy,
				terrain: terrain()?.snapshot?.() || { state: 'waiting' }
			});
		}
	};
}

function installDisabledStreamingDiagnostics(diagnostics, policy) {
	const snapshot = () => Object.freeze({
		botanical: { state: 'disabled' },
		destroyed: false,
		policy,
		terrain: { state: 'disabled' }
	});
	diagnostics.terrainEnrichmentPromise = Promise.resolve({ state: 'disabled' });
	diagnostics.botanicalEnrichmentPromise = Promise.resolve({ state: 'disabled' });
	diagnostics.botanicalStreamingGatePromise = Promise.resolve({ state: 'disabled' });
	diagnostics.optionalWorldStreamingState = snapshot;
	const controller = { destroy() {}, snapshot };
	diagnostics.optionalWorldStreaming = controller;
	return controller;
}

export default startEretzOptionalWorldStreaming;
