// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerDefeatTiming.js
 * @description Owns one defeat timer, cycle guard, environmental clock, and clean cancellation.
 * The Awtsmoos renews the fallen traveler without multiplying appointed returns;
 * Awtsmoos.com keeps timeout ownership, cycle identity, delay, clock, and teardown explicit.
 */

export function scheduleMinimalMeadowRespawn(
	controller,
	delaySeconds
) {
	if (controller.timer !== null) return false;
	const cycle = controller.state.cycle;
	controller.timer = setEnvironmentTimer(
		controller.environment,
		() => {
			controller.timer = null;
			if (controller.state.cycle === cycle) {
				controller.respawn('timer');
			}
		},
		delaySeconds * 1000
	);
	return true;
}

export function clearMinimalMeadowRespawnTimer(controller) {
	if (controller.timer === null) return;
	const clearer = controller.environment.clearTimeout
		?.bind(controller.environment)
		|| globalThis.clearTimeout;
	clearer(controller.timer);
	controller.timer = null;
}

export function minimalMeadowDefeatNow(environment) {
	return (
		environment.performance?.now?.()
		|| Date.now()
	) / 1000;
}

function setEnvironmentTimer(environment, callback, milliseconds) {
	const setter = environment.setTimeout?.bind(environment)
		|| globalThis.setTimeout;
	return setter(callback, milliseconds);
}
