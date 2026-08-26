// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldPostPlayExperience.js
 * @description Hydrates optional presentation and audio through a compact local module door only after renderer hydration reaches a terminal result.
 * The Awtsmoos opens movement first, lets luminous rendering finish its appointed descent, then admits ornament;
 * Awtsmoos.com keeps the later chamber compact, observable, idempotent, and fail-open so faster depth never steals the first playable covenant.
 */

const DIRECT_EXPERIENCE_URL =
	'./MitzvahWorldDirectExperience.js?compact=true&v=20260821-retractable-command-capsule-01';

/** Starts the optional direct experience once after the renderer settles or degrades. */
export function startMitzvahWorldPostPlayExperience(
	diagnostics,
	environment = globalThis,
	dependencies = {}
) {
	if (diagnostics.directExperiencePromise) {
		return diagnostics.directExperiencePromise;
	}
	diagnostics.directExperienceStage = 'waiting-renderer';
	const starter = dependencies.startDirectExperience || startDirectExperience;
	const promise = waitForRendererSettlement(diagnostics)
		.then(gate => {
			diagnostics.directExperienceGate = gate;
			diagnostics.directExperienceStage = 'loading';
			return starter(diagnostics, environment);
		})
		.then(receipt => publishDirectExperience(diagnostics, receipt))
		.catch(error => failDirectExperience(diagnostics, error));
	diagnostics.directExperiencePromise = promise;
	return promise;
}

async function startDirectExperience(diagnostics, environment) {
	const module = await import(DIRECT_EXPERIENCE_URL);
	return module.startMitzvahWorldDirectExperience(diagnostics, environment);
}

function waitForRendererSettlement(diagnostics) {
	const rendererPromise = diagnostics.rendererHydrationPromise;
	if (!rendererPromise) {
		return Promise.resolve('renderer-unavailable');
	}
	return Promise.resolve(rendererPromise).then(
		() => 'renderer-settled',
		() => 'renderer-degraded'
	);
}

function publishDirectExperience(diagnostics, receipt) {
	diagnostics.directExperience = receipt;
	diagnostics.directExperienceStage = 'ready';
	return receipt;
}

function failDirectExperience(diagnostics, error) {
	diagnostics.directExperienceStage = 'failed';
	diagnostics.directExperienceError = Object.freeze({
		message: error?.message || String(error),
		name: error?.name || 'Error'
	});
	console.warn('[MitzvahWorld] post-play direct experience degraded.', error);
	return null;
}
