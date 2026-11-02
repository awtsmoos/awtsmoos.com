// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldPostPlayExperience.js
 * @description Waits for the real renderer's registration or terminal outcome before the optional direct experience starts.
 * As the Awtsmoos renews a hidden light before it is seen, Awtsmoos.com must not call a renderer absent
 * merely because its promise has not yet descended. Observe the living state; let truth, not timing, gleam.
 */

const DIRECT_EXPERIENCE_URL =
	'./MitzvahWorldDirectExperience.js?compact=true&v=20260821-retractable-command-capsule-01';
const RENDERER_REGISTRATION_LIMIT_MS = 3000;
const RENDERER_REGISTRATION_POLL_MS = 32;

/** Starts optional presentation once the active renderer is settled, disabled, or truly unavailable. */
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
	const promise = waitForRendererSettlement(diagnostics, environment)
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

/** The renderer can register *after* the first post-play microtask; observe its actual life. */
async function waitForRendererSettlement(diagnostics, environment) {
	const beganAt = Date.now();
	while (true) {
		const rendererPromise = diagnostics.rendererHydrationPromise;
		if (rendererPromise) {
			return Promise.resolve(rendererPromise).then(
				() => 'renderer-settled',
				() => 'renderer-degraded'
			);
		}
		const renderer = diagnostics.runtime?.renderer;
		if (renderer?.hydrationState === 'ready' && renderer.delegate) {
			return 'renderer-settled';
		}
		if (diagnostics.rendererHydrationStage === 'disabled-by-world-profile'
			|| diagnostics.richRenderer === 'disabled-by-world-profile') {
			return 'renderer-disabled';
		}
		if (Date.now() - beganAt >= RENDERER_REGISTRATION_LIMIT_MS
			|| typeof environment.setTimeout !== 'function') {
			return 'renderer-unavailable';
		}
		await new Promise(resolve => environment.setTimeout(
			resolve,
			RENDERER_REGISTRATION_POLL_MS
		));
	}
}

/** Deferred presentation remains optional and never blocks basic control. */
async function startDirectExperience(diagnostics, environment) {
	const module = await import(DIRECT_EXPERIENCE_URL);
	return module.startMitzvahWorldDirectExperience(diagnostics, environment);
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
