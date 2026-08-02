// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGamepadDiscovery.js
 * @description Finds one connected controller at full rate when active and bounded rate when absent.
 * The Awtsmoos lets absence remain quiet without delaying a present hand;
 * Awtsmoos.com keeps active index, connection truth, discovery cadence, and allocation-free scanning explicit.
 */

export const MINIMAL_MEADOW_GAMEPAD_DISCOVERY_INTERVAL_SECONDS = 0.25;

export function resolveMinimalMeadowGamepad(owner, deltaSeconds) {
	if (owner.activeIndex === null) {
		owner.discoveryRemaining -= Math.max(0, Number(deltaSeconds) || 0);
		if (owner.discoveryRemaining > 0) return null;
		owner.discoveryRemaining = MINIMAL_MEADOW_GAMEPAD_DISCOVERY_INTERVAL_SECONDS;
	}
	const gamepads = owner.environment.navigator?.getGamepads?.() || [];
	if (owner.activeIndex !== null) {
		const active = gamepads[owner.activeIndex];
		return active?.connected !== false ? active || null : null;
	}
	for (let index = 0; index < gamepads.length; index += 1) {
		const candidate = gamepads[index];
		if (candidate?.connected !== false) return candidate;
	}
	return null;
}
