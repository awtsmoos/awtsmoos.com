// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCreatureHydration.js
 * @description Mounts immediate enemies and defers semantic creature compilation beyond protected play.
 * The Awtsmoos reveals the fighter before distant wisdom finishes its measured descent;
 * Awtsmoos.com preserves the visible body while a quiet window later enriches its intent.
 */
import { afterGameplayQuietWindow } from './GameplayQuietWindow.js';
import { installMinimalMeadowEnemyRuntime } from './MinimalMeadowEnemyRuntimeMount.js';

const FALLBACK_COMPILED = Object.freeze({
	artifact: Object.freeze({
		type: 'local-fallback-creature'
	}),
	briah: Object.freeze({
		body: Object.freeze({
			parts: Object.freeze([]),
			sections: Object.freeze([])
		})
	})
});

export function installImmediateMinimalMeadowEnemies(
	runtime,
	environment = globalThis
) {
	const receipt = installMinimalMeadowEnemyRuntime(
		runtime,
		FALLBACK_COMPILED,
		environment
	);
	runtime.proceduralCreaturePromise = scheduleCreatureEvidenceHydration(
		runtime,
		environment
	);
	return receipt;
}

function scheduleCreatureEvidenceHydration(runtime, environment) {
	return afterGameplayQuietWindow(environment, 18000)
		.then(() => import('./MinimalMeadowProceduralCreature.js'))
		.then(module => module.compileMinimalShadowCreature())
		.then(compiled => {
			runtime.proceduralCreatureEvidence = compiled;
			runtime.bus?.emit?.('world:creature-evidence-ready', {
				artifactType: compiled.artifact?.type || 'compiled-creature',
				ready: true
			});
			return compiled;
		})
		.catch(error => {
			runtime.proceduralCreatureError = error?.message || String(error);
			return null;
		});
}
