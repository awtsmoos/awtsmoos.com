//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MinimalMeadowVisibleReadiness.js
 * @description Waits for visibly rendered first-play reality instead of trusting allocated runtime objects.
 * The Awtsmoos does not let Awtsmoos.com call an empty shell playable: authored Chossid, bootstrap terrain,
 * movement heartbeat, and one successful rendered frame must stand together while the loading veil remains present.
 */

import {
	attachedVisibleRoot,
	visibleRenderableCount
} from './MinimalMeadowVisibleObjectEvidence.js';

const DEFAULT_TIMEOUT_MS = 2500;

/** Waits a bounded interval for visible play, returning the final immutable receipt. */
export async function awaitMinimalMeadowVisibleReadiness(
	runtime,
	environment = globalThis,
	timeoutMilliseconds = DEFAULT_TIMEOUT_MS
) {
	const startedAt = now(environment);
	let receipt = inspectMinimalMeadowVisibleReadiness(runtime);
	while (!receipt.ready && now(environment) - startedAt < timeoutMilliseconds) {
		await nextOpportunity(environment);
		receipt = inspectMinimalMeadowVisibleReadiness(runtime);
	}
	return receipt;
}

/** Returns an immutable receipt describing whether the visibly playable covenant is satisfied. */
export function inspectMinimalMeadowVisibleReadiness(runtime) {
	const missing = [];
	const canonical = runtime?.canonicalPlayer;
	if (canonical?.status !== 'ready' || canonical?.fallback !== false) {
		missing.push('canonical-player-receipt');
	}
	const model = runtime?.model;
	if (!attachedVisibleRoot(model, runtime?.scene)) {
		missing.push('canonical-player-visible');
	}
	const playerMeshes = visibleRenderableCount(runtime?.visiblePlayer || model);
	if (playerMeshes < 1) missing.push('canonical-player-mesh');
	const terrainGroup = runtime?.terrain?.group;
	if (!attachedVisibleRoot(terrainGroup, runtime?.scene)) {
		missing.push('bootstrap-terrain-visible');
	}
	const terrainMeshes = visibleRenderableCount(terrainGroup);
	if (terrainMeshes < 1) missing.push('bootstrap-terrain-mesh');
	if (!runtime?.movement) missing.push('movement-loop');
	if (!(Number(runtime?.bootstrapFrames) > 0) || !Number.isFinite(runtime?.lastFrameAt)) {
		missing.push('painted-gameplay-frame');
	}
	if (runtime?.lastFrameError) missing.push('frame-error');
	return Object.freeze({
		frames: Number(runtime?.bootstrapFrames) || 0,
		missing: Object.freeze(missing),
		playerMeshes,
		ready: missing.length === 0,
		terrainMeshes
	});
}

function nextOpportunity(environment) {
	return new Promise(resolve => {
		let settled = false;
		const finish = () => {
			if (settled) return;
			settled = true;
			resolve();
		};
		environment.requestAnimationFrame?.(finish);
		environment.setTimeout?.(finish, 80);
		if (!environment.requestAnimationFrame && !environment.setTimeout) finish();
	});
}

function now(environment) {
	return environment.performance?.now?.() ?? Date.now();
}
