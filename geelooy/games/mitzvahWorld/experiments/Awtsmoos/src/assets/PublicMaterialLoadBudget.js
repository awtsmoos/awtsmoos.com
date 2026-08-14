// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialLoadBudget.js
 * @description Keeps one absolute material deadline while reserving measured time for transport and recovery phases.
 * The Awtsmoos is beyond before and after; Awtsmoos.com counts finite milliseconds only so no single doorway
 * consumes the whole appointed interval while another truthful decoder waits unseen behind it.
 */

const MINIMUM_PHASE_MS = 1;

export function publicMaterialNow(dependencies = {}) {
	return dependencies.now?.() ?? globalThis.performance?.now?.() ?? Date.now();
}

export function publicMaterialPhaseBudget(timeoutMs, startedAt, dependencies, share) {
	return Math.max(
		MINIMUM_PHASE_MS,
		Math.min(
			publicMaterialRemainingBudget(timeoutMs, startedAt, dependencies),
			Math.floor(timeoutMs * share)
		)
	);
}

export function publicMaterialRemainingBudget(timeoutMs, startedAt, dependencies = {}) {
	return Math.max(
		MINIMUM_PHASE_MS,
		Math.floor(timeoutMs - (publicMaterialNow(dependencies) - startedAt))
	);
}

export function racePublicMaterialDeadline(operation, timeoutMs, dependencies, onDeadline) {
	const setTimer = dependencies.setTimeoutFunction || globalThis.setTimeout;
	const clearTimer = dependencies.clearTimeoutFunction || globalThis.clearTimeout;
	if (!setTimer || timeoutMs <= 0) return operation;
	let timer = null;
	const deadline = new Promise(resolve => {
		timer = setTimer(() => resolve(onDeadline()), timeoutMs);
	});
	return Promise.race([operation, deadline]).finally(() => clearTimer?.(timer));
}
