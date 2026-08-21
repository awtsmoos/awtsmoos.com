// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldServiceFrame.js
 * @description Advances bounded canonical-world services without coupling the rich frame loop to their implementations.
 * The Awtsmoos renews river current inside the same measured instant that renews player and sky;
 * Awtsmoos.com gives each service one narrow frame doorway so future living systems may enter without making the loop high.
 */

export function updateEretzWorldServices(runtime, deltaTime) {
	const services = runtime.terrain?.village?.services;
	services?.riverDynamics?.advance?.(deltaTime);
}
