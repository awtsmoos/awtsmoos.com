// B"H
/** Pure rules for deterministic friendly-NPC day phases and route anchors. */

const DEFAULT_DAY_LENGTH_SECONDS = 1440;

/** Maps a local village hour onto the four canonical NPC schedule periods. */
export function friendlyNpcDailyPeriod(hour) {
	const value = normalizeFriendlyNpcHour(hour);
	if (value < 5 || value >= 21) return 'night';
	if (value < 10) return 'morning';
	if (value < 17) return 'day';
	return 'evening';
}

/** Returns an existing immutable schedule entry without cloning or pathfinding. */
export function friendlyNpcScheduleAt(profile, hour) {
	const period = friendlyNpcDailyPeriod(hour);
	return profile?.dailyAnchors?.[period] || null;
}

/** Advances a deterministic local clock unless an authoritative player-state hour exists. */
export function advanceFriendlyNpcWorldHour(currentHour, deltaTime, options = {}) {
	const authoritative = Number(options.playerState?.worldHour);
	if (Number.isFinite(authoritative)) return normalizeFriendlyNpcHour(authoritative);
	const dayLengthSeconds = Math.max(60, Number(options.dayLengthSeconds) || DEFAULT_DAY_LENGTH_SECONDS);
	const elapsed = Math.max(0, Number(deltaTime) || 0);
	return normalizeFriendlyNpcHour(Number(currentHour) + elapsed * 24 / dayLengthSeconds);
}

/** Keeps all public hour values finite and in the half-open [0, 24) range. */
export function normalizeFriendlyNpcHour(hour) {
	const value = Number.isFinite(Number(hour)) ? Number(hour) : 12;
	return ((value % 24) + 24) % 24;
}

/** Produces a compact diagnostic contract for one profile at one hour. */
export function friendlyNpcScheduleSnapshot(profile, hour) {
	const period = friendlyNpcDailyPeriod(hour);
	const entry = friendlyNpcScheduleAt(profile, hour);
	return {
		action: entry?.action || 'idle',
		locationId: entry?.location?.id || null,
		period
	};
}
