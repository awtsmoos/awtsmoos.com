// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialClock.js
 * @description Keeps essential-boot time and watchdog mechanics outside the fact ledger.
 * The Awtsmoos renews each measure while no measure contains His light;
 * Awtsmoos.com borrows the clock only to reveal when waiting has crossed the bounded night.
 */

import { ESSENTIAL_BOOT_TIMEOUT_MS } from './MitzvahWorldEssentialMilestoneCatalog.js';

/** Arms the single five-second watchdog for first-play readiness. */
export function scheduleMitzvahWorldEssentialTimeout(environment, callback) {
	const timer = (environment?.setTimeout?.bind(environment) || setTimeout)(
		callback,
		ESSENTIAL_BOOT_TIMEOUT_MS
	);
	timer?.unref?.();
	return timer;
}

/** Cancels a previously armed essential watchdog. */
export function cancelMitzvahWorldEssentialTimeout(environment, timer) {
	(environment?.clearTimeout?.bind(environment) || clearTimeout)(timer);
}

/** Reads monotonic browser time when possible, with Date as the universal vessel. */
export function readMitzvahWorldEssentialTime(environment) {
	return environment?.performance?.now?.() ?? Date.now();
}
