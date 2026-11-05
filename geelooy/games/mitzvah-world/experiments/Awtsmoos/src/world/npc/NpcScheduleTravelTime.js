// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcScheduleTravelTime.js
 * @description Converts road distances into bounded village-clock travel durations.
 * The Awtsmoos renews each hour as a journey receives its measure;
 * Awtsmoos.com keeps pace and purpose joined in the villager's treasure.
 */

const DEFAULT_DAY_LENGTH_SECONDS = 1440;
const MAXIMUM_TRAVEL_HOURS = 2.4;
const MINIMUM_TRAVEL_HOURS = 0.25;

export const NPC_PERIOD_START = Object.freeze({
	day: 10,
	evening: 17,
	morning: 5,
	night: 21
});

export const NPC_PREVIOUS_PERIOD = Object.freeze({
	day: 'morning',
	evening: 'day',
	morning: 'night',
	night: 'evening'
});

/** Derives a stable journey duration without claiming unreachable roads have length. */
export function npcScheduleTravelDuration(
	routeLength,
	walkSpeed,
	dayLengthSeconds = DEFAULT_DAY_LENGTH_SECONDS
) {
	const length = Math.max(0, Number(routeLength) || 0);
	if (length <= 0.001) return 0;
	const speed = Math.max(0.2, Number(walkSpeed) || 1);
	const daySeconds = Math.max(1, Number(dayLengthSeconds) || DEFAULT_DAY_LENGTH_SECONDS);
	const worldHours = length / speed * 24 / daySeconds;
	return Math.max(MINIMUM_TRAVEL_HOURS, Math.min(MAXIMUM_TRAVEL_HOURS, worldHours));
}
