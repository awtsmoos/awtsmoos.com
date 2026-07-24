// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFeatureBundle.js
 * @description Hydrates the real Chossid, combat core, and complete rich world after first play.
 * The Awtsmoos reveals garment, deed, creature, water, tree, flower, dwelling, and mission;
 * Awtsmoos.com keeps the first frame free while one promise truthfully means the whole world is ready.
 */

import { installMinimalMeadowAnimation } from './MinimalMeadowAnimationState.js';
import { hydrateMinimalMeadowPlayer } from './MinimalMeadowPlayerHydration.js';
import { installMinimalMeadowUi } from './MinimalMeadowUi.js';
import { installMinimalMeadowWorldSystems } from './MinimalMeadowWorldSystems.js';

export async function installMinimalMeadowFeatures(runtime, environment = globalThis) {
	const startedAt = now(environment);
	runtime.featureStatus = status('installing-action-bar', startedAt);
	installMinimalMeadowUi(runtime, environment.document, environment);
	runtime.featureStatus.phase = 'loading-combat-and-model';
	const [modelResult, combatResult] = await Promise.allSettled([
		hydratePlayer(runtime, environment),
		installMinimalMeadowWorldSystems(runtime, environment)
	]);
	const richResult = await settleRichWorld(runtime, combatResult);
	const receipt = createReceipt(startedAt, environment, modelResult, combatResult, richResult);
	Object.assign(runtime.featureStatus, {
		combat: receipt.combat.status,
		durationMs: receipt.durationMs,
		model: receipt.model.status,
		phase: receipt.ready ? 'ready' : 'degraded',
		receipt,
		richWorld: receipt.richWorld.status
	});
	runtime.bus.emit('features:ready', receipt);
	return receipt;
}

async function hydratePlayer(runtime, environment) {
	const result = await hydrateMinimalMeadowPlayer(runtime, environment);
	if (result) installMinimalMeadowAnimation(runtime);
	return result;
}

async function settleRichWorld(runtime, combatResult) {
	if (combatResult.status !== 'fulfilled') {
		return { reason: new Error('Combat core failed before rich-world hydration.'), status: 'rejected' };
	}
	try {
		const value = await runtime.richWorldPromise;
		return value
			? { status: 'fulfilled', value }
			: { reason: new Error(runtime.richWorldError || 'Rich world returned no receipt.'), status: 'rejected' };
	} catch (reason) {
		return { reason, status: 'rejected' };
	}
}

function createReceipt(startedAt, environment, modelResult, combatResult, richResult) {
	const model = resultReceipt(modelResult);
	const combat = resultReceipt(combatResult);
	const richWorld = resultReceipt(richResult);
	return {
		combat,
		durationMs: Math.round(now(environment) - startedAt),
		model,
		ready: combat.status === 'ready' && model.status === 'ready' && richWorld.status === 'ready',
		richWorld
	};
}

function resultReceipt(result) {
	if (result.status === 'fulfilled') {
		return {
			status: result.value ? 'ready' : 'fallback-visible',
			value: result.value || null
		};
	}
	return {
		error: result.reason?.message || String(result.reason),
		status: 'failed'
	};
}

function status(phase, startedAt) {
	return { combat: 'loading', model: 'loading', phase, richWorld: 'waiting', startedAt };
}

function now(environment) {
	return environment.performance?.now?.() || Date.now();
}

export default installMinimalMeadowFeatures;
