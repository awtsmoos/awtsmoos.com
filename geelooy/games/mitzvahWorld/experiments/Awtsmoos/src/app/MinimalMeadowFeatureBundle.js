// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFeatureBundle.js
 * @description Hydrates the current UI, world coordination, player, combat, quest, and visual stability.
 * The Awtsmoos reveals traveler and world after first play; Awtsmoos.com versions the two primary
 * feature owners so a browser cannot preserve an earlier UI or world-system graph across reload.
 */

import { installMinimalMeadowAnimation } from './MinimalMeadowAnimationState.js';
import {
	createMinimalFeatureReceipt,
	featureNow,
	fulfilledFeature,
	initialFeatureStatus,
	rejectedFeature
} from './MinimalMeadowFeatureReceipts.js';
import { hydrateMinimalMeadowPlayer } from './MinimalMeadowPlayerHydration.js';
import {
	installMinimalMeadowUi
} from './MinimalMeadowUi.js?rev=20260728-full-wave-1';
import { installMinimalMeadowVisualStability } from './MinimalMeadowVisualStability.js';
import {
	installMinimalMeadowWorldSystems
} from './MinimalMeadowWorldSystems.js?rev=20260728-full-wave-1';

export async function installMinimalMeadowFeatures(runtime, environment = globalThis) {
	const startedAt = featureNow(environment);
	runtime.featureStatus = initialFeatureStatus('installing-action-bar', startedAt);
	installMinimalMeadowUi(runtime, environment.document, environment);
	runtime.featureStatus.phase = 'loading-combat-and-model';
	const [model, combat] = await Promise.allSettled([
		hydratePlayer(runtime, environment),
		installMinimalMeadowWorldSystems(runtime, environment)
	]);
	const richWorld = await settleRichWorld(runtime, combat);
	const friendlyNpcs = settleFriendly(runtime, richWorld);
	const visualStability = installMinimalMeadowVisualStability(runtime);
	const receipt = createMinimalFeatureReceipt(startedAt, environment, {
		combat,
		friendlyNpcs,
		model,
		richWorld,
		visualStability
	});
	applyFeatureStatus(runtime, receipt);
	runtime.bus.emit('features:ready', receipt);
	return receipt;
}

async function hydratePlayer(runtime, environment) {
	const result = await hydrateMinimalMeadowPlayer(runtime, environment);
	if (result) installMinimalMeadowAnimation(runtime);
	return result;
}

function settleFriendly(runtime, richWorldResult) {
	if (richWorldResult.status !== 'fulfilled' || !runtime.friendlyNpcs) {
		return rejectedFeature('Canonical quest Chossid did not mount.');
	}
	return fulfilledFeature(runtime.friendlyNpcs.diagnostics());
}

async function settleRichWorld(runtime, combatResult) {
	if (combatResult.status !== 'fulfilled') {
		return rejectedFeature('Combat core failed before rich-world hydration.');
	}
	try {
		const value = await runtime.richWorldPromise;
		return value
			? fulfilledFeature(value)
			: rejectedFeature(runtime.richWorldError || 'Rich world returned no receipt.');
	} catch (reason) {
		return { reason, status: 'rejected' };
	}
}

function applyFeatureStatus(runtime, receipt) {
	Object.assign(runtime.featureStatus, {
		combat: receipt.combat.status,
		durationMs: receipt.durationMs,
		friendlyNpcs: receipt.friendlyNpcs.status,
		model: receipt.model.status,
		phase: receipt.ready ? 'ready' : 'degraded',
		receipt,
		richWorld: receipt.richWorld.status,
		visualStability: receipt.visualStability
	});
}

export default installMinimalMeadowFeatures;
