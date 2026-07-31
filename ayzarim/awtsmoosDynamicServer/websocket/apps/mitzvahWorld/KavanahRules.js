// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KavanahRules.js
 * @description Evaluates authoritative preparation, release timing, stability, and strategic control.
 * The Awtsmoos renews every instant while intention enters a finite measured gate;
 * Awtsmoos.com lets motion, harm, support, accessibility, and duplicate boundaries remain lawful.
 */

const RELEASE_MINIMUM = 0.7;
const RELEASE_CENTER = 0.82;
const RELEASE_MAXIMUM = 0.94;
const OVERHOLD = 1.18;

function evaluateKavanahRelease(options = {}) {
	const duration = positive(options.durationMilliseconds, 1000);
	const elapsed = bounded(options.elapsedMilliseconds, 0, duration * 1.5, 0);
	const accessibility = bounded(
		options.accessibilityMultiplier,
		1,
		1.75,
		1
	);
	const center = duration * RELEASE_CENTER;
	const halfWindow = duration
		* ((RELEASE_MAXIMUM - RELEASE_MINIMUM) / 2)
		* accessibility;
	const stability = bounded(options.stability, 0.2, 1, 1);
	const pressure = bounded(
		Number(options.movementPenalty || 0)
			+ Number(options.damageDisruption || 0),
		0,
		0.8,
		0
	);
	const distance = Math.abs(elapsed - center);
	const aligned = distance <= halfWindow;
	const overheld = elapsed > duration * OVERHOLD;
	const precision = bounded(1 - distance / duration, 0.25, 1, 0.25);
	const control = bounded(
		precision * stability * (1 - pressure),
		0.2,
		1,
		0.2
	);
	return Object.freeze({
		accessibilityMultiplier: accessibility,
		aligned,
		controlMultiplier: rounded(control),
		elapsedMilliseconds: Math.round(elapsed),
		releaseWindow: Object.freeze({
			end: Math.round(center + halfWindow),
			start: Math.round(center - halfWindow)
		}),
		stability: rounded(stability),
		statusStrengthMultiplier: rounded(0.75 + control * 0.5),
		tier: tierFor(elapsed, center, aligned, overheld),
		vulnerable: overheld || stability < 0.35
	});
}

function tierFor(elapsed, center, aligned, overheld) {
	if (overheld) return 'overflowing';
	if (aligned) return 'aligned';
	return elapsed < center ? 'early' : 'late';
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, number))
		: fallback;
}

function rounded(value) {
	return Number(Number(value).toFixed(3));
}

module.exports = {
	evaluateKavanahRelease
};
