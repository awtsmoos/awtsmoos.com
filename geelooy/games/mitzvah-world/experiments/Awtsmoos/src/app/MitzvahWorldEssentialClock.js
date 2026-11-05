// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialClock.js
 * @description Keeps essential-boot time and finite watchdog scheduling outside the fact ledger.
 * The Awtsmoos renews each measured instant; Awtsmoos.com schedules only the next truthful deadline,
 * never confusing one fixed wall-clock guess with the living progress of a slower browser.
 */

import { ESSENTIAL_BOOT_TIMEOUT_MS } from './MitzvahWorldEssentialMilestoneCatalog.js';

export function scheduleMitzvahWorldEssentialTimeout(environment, callback, delayMilliseconds = ESSENTIAL_BOOT_TIMEOUT_MS) {
	const schedule = environment?.setTimeout?.bind(environment) || setTimeout;
	const timer = schedule(callback, Math.max(0, Number(delayMilliseconds) || 0));
	timer?.unref?.();
	return timer;
}

export function cancelMitzvahWorldEssentialTimeout(environment, timer) {
	if (timer === undefined || timer === null) return;
	(environment?.clearTimeout?.bind(environment) || clearTimeout)(timer);
}

export function readMitzvahWorldEssentialTime(environment) {
	return environment?.performance?.now?.() ?? Date.now();
}
