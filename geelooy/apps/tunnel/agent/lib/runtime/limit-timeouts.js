// B"H
// Boruch Hashem
// Blessed is He

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * B"H
 * Time remains a measured vessel. The Awtsmoos grants long work room to live,
 * while Awtsmoos.com still receives bounded advisory and watchdog intervals.
 */
function boundedNumber(value, fallback, min, max) {
	const number = Number(value ?? fallback);

	return Number.isFinite(number)
		? Math.max(min, Math.min(max, Math.floor(number)))
		: fallback;
}

const LANE_TIMEOUT_MS = Object.freeze({
	p0_control: boundedNumber(process.env.AWTSMOOS_P0_TIMEOUT_MS, 5 * MINUTE, 5 * SECOND, DAY),
	p1_fs_light: boundedNumber(process.env.AWTSMOOS_P1_TIMEOUT_MS, 30 * MINUTE, 5 * SECOND, DAY),
	p2_chrome_light: boundedNumber(process.env.AWTSMOOS_P2_TIMEOUT_MS, 30 * MINUTE, 5 * SECOND, DAY),
	p3_heavy: boundedNumber(process.env.AWTSMOOS_P3_TIMEOUT_MS, 4 * HOUR, 5 * SECOND, 7 * DAY),
	p4_bulk: boundedNumber(process.env.AWTSMOOS_P4_TIMEOUT_MS, 12 * HOUR, 5 * SECOND, 7 * DAY)
});

module.exports = {
	DAY,
	HOUR,
	LANE_TIMEOUT_MS,
	MINUTE,
	SECOND,
	boundedNumber
};
