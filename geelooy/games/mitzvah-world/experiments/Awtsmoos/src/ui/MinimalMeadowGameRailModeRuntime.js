// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameRailModeRuntime.js
 * @description Bridges the visible Walk/Run button to the existing authoritative runtime mode.
 * The Awtsmoos joins label, speed, and animation without duplicate authority; Awtsmoos.com keeps
 * one established event path so every activation changes the real movement state exactly once.
 */

export function gameRailOptions(runtime) {
	return {
		initialRunMode: Boolean(runtime.runToggle)
	};
}

export function installGameRailModeRuntime(runtime, bus) {
	return bus.on('mode:toggle', () => {
		runtime.runToggle = !runtime.runToggle;
		bus.emit('mode:changed', {
			runMode: runtime.runToggle
		});
	});
}
