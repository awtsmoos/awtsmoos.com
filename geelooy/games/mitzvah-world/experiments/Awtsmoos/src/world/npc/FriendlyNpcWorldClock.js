// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FriendlyNpcWorldClock.js
 * @description Advances one shared village hour for every friendly inhabitant.
 * The Awtsmoos renews a single sun above many lives; Awtsmoos.com lets prayer,
 * labor, gathering, and rest share one measured time instead of drifting apart.
 */

import {
	advanceFriendlyNpcWorldHour,
	normalizeFriendlyNpcHour
} from './FriendlyNpcScheduleRules.js';

const DEFAULT_DAY_LENGTH_SECONDS = 1440;
const DEFAULT_INITIAL_HOUR = 13;

/** Owns the normalized, optionally authoritative clock used by friendly NPCs. */
export class FriendlyNpcWorldClock {
	constructor(options = {}) {
		this.dayLengthSeconds = positiveNumber(
			options.dayLengthSeconds,
			DEFAULT_DAY_LENGTH_SECONDS
		);
		this.hour = normalizeFriendlyNpcHour(
			options.initialHour ?? DEFAULT_INITIAL_HOUR
		);
		this.updates = 0;
	}

	/** Advances once for the population and returns the shared normalized hour. */
	update(deltaTime, playerState) {
		this.hour = advanceFriendlyNpcWorldHour(this.hour, deltaTime, {
			dayLengthSeconds: this.dayLengthSeconds,
			playerState
		});
		this.updates += 1;
		return this.hour;
	}

	/** Returns allocation-light diagnostics outside the animation hot path. */
	stats() {
		return {
			dayLengthSeconds: this.dayLengthSeconds,
			hour: this.hour,
			updates: this.updates
		};
	}
}

function positiveNumber(value, fallback) {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
