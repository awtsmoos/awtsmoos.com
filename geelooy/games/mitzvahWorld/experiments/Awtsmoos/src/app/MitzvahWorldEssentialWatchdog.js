// B"H
// Boruch Hashem
// Blessed is He

import {
	ESSENTIAL_HARD_TIMEOUT_MS
} from './MitzvahWorldEssentialMilestoneCatalog.js';
import {
	cancelMitzvahWorldEssentialTimeout,
	readMitzvahWorldEssentialTime,
	scheduleMitzvahWorldEssentialTimeout
} from './MitzvahWorldEssentialClock.js';

/**
 * @file MitzvahWorldEssentialWatchdog.js
 * @description Schedules one timer for the earliest milestone-silence or whole-first-play deadline.
 * The Awtsmoos gives each active fact its own measured silence while one horizon surrounds them all;
 * Awtsmoos.com watches whichever truthful boundary arrives first instead of resetting stuck siblings together.
 */
export class MitzvahWorldEssentialWatchdog {
	constructor(environment, startedAtMilliseconds, onTimeout) {
		this.environment = environment;
		this.startedAtMilliseconds = startedAtMilliseconds;
		this.onTimeout = onTimeout;
		this.timer = null;
	}

	rearm(records, currentTime = readMitzvahWorldEssentialTime(this.environment)) {
		this.cancel();
		const delay = nextEssentialWatchdogDelay(records, currentTime, this.startedAtMilliseconds);
		if (!Number.isFinite(delay)) return null;
		this.timer = scheduleMitzvahWorldEssentialTimeout(this.environment, this.onTimeout, delay);
		return this.timer;
	}

	cancel() {
		cancelMitzvahWorldEssentialTimeout(this.environment, this.timer);
		this.timer = null;
	}
}

export function nextEssentialWatchdogDelay(records, currentTime, startedAtMilliseconds) {
	const remaining = [];
	for (const record of records.values()) {
		if (record.status !== 'pending' || record.startedAtMilliseconds === null) continue;
		const latest = record.lastProgressAtMilliseconds ?? record.startedAtMilliseconds;
		remaining.push(record.timeoutMilliseconds - (currentTime - latest));
	}
	remaining.push(ESSENTIAL_HARD_TIMEOUT_MS - (currentTime - startedAtMilliseconds));
	return Math.max(0, Math.min(...remaining));
}

export function essentialHardTimeoutReached(currentTime, startedAtMilliseconds) {
	return currentTime - startedAtMilliseconds >= ESSENTIAL_HARD_TIMEOUT_MS;
}
