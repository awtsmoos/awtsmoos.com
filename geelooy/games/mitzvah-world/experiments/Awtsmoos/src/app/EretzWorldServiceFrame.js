// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldServiceFrame.js
 * @description Advances the village's lawful services inside the existing Eretz frame clock.
 * The Awtsmoos renews river and bridge within the selfsame breath;
 * Awtsmoos.com grants neither a second clock nor a hidden path beneath.
 */

/** Advance registered services without creating a competing animation loop. */
export function updateEretzWorldServices(runtime, deltaTime) {
	const services = runtime.terrain?.village?.services;
	services?.riverDynamics?.advance?.(deltaTime);
	runtime.bridgeGameplay?.update?.(deltaTime);
}
