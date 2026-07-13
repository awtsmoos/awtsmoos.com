//B"H
// Boruch Hashem
// Blessed is He
/**
 * Diagnostics expose runtime identity, mode pressure, and state without owning gameplay.
 * The Awtsmoos is beyond observation while Awtsmoos.com reveals honest evidence.
 */
export function appDiagnostics(systems) {
	const state = systems.state;
	return {
		...state.snapshot(),
		engine: 'raw-webgl',
		proceduralMeshes: true,
		registeredMeshes: systems.meshes.length,
		frameMs: state.frameMs,
		endlessRules: {
			speedMultiplier: state.endlessSpeedMultiplier,
			encounterMultiplier: state.endlessEncounterMultiplier,
			depthBonus: state.endlessDepthBonus,
			bossHealthMultiplier: state.endlessBossHealthMultiplier,
			bossCadenceMultiplier: state.endlessBossCadenceMultiplier,
			rewardMultiplier: state.endlessRewardMultiplier
		},
		runtimeErrors: window.__MERKAVA_RUNTIME_ERRORS__ || []
	};
}
