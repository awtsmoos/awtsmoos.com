// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowKavanahPolicy.js
 * @description Evaluates deliberate Torah release without turning intention into renamed mana.
 * The Awtsmoos renews each measured instant while purpose enters a finite window;
 * Awtsmoos.com lets timing, stability, motion, harm, and accessibility meet in honest law.
 */

export const KAVANAH_TIERS = Object.freeze(['unformed', 'early', 'aligned', 'late', 'overflowing']);

export function evaluateMinimalMeadowKavanah(options = {}) {
	const castMilliseconds = positive(options.castMilliseconds, 1000);
	const elapsedMilliseconds = nonnegative(options.elapsedMilliseconds);
	const accessibilityMultiplier = bounded(options.accessibilityMultiplier, 1, 1.75, 1);
	const center = castMilliseconds * 0.82;
	const halfWindow = castMilliseconds * 0.12 * accessibilityMultiplier;
	const stability = bounded(options.stability, 0, 1, 1);
	const pressure = bounded(
		Number(options.movementPenalty || 0) + Number(options.damageDisruption || 0),
		0,
		0.8,
		0
	);
	const distance = Math.abs(elapsedMilliseconds - center);
	const aligned = distance <= halfWindow;
	const overheld = elapsedMilliseconds > castMilliseconds * 1.18;
	const tier = releaseTier(elapsedMilliseconds, center, aligned, overheld);
	const precision = bounded(1 - distance / castMilliseconds, 0.25, 1, 0.25);
	const control = bounded(precision * stability * (1 - pressure), 0.2, 1, 0.2);
	return Object.freeze({
		accessibilityMultiplier,
		aligned,
		controlMultiplier: Number(control.toFixed(3)),
		elapsedMilliseconds,
		releaseWindow: Object.freeze({
			end: Math.round(center + halfWindow),
			start: Math.round(center - halfWindow)
		}),
		stability: Number(stability.toFixed(3)),
		statusStrengthMultiplier: Number((0.75 + control * 0.5).toFixed(3)),
		tier,
		vulnerable: overheld || stability < 0.35
	});
}

function releaseTier(elapsed, center, aligned, overheld) {
	if (overheld) return 'overflowing';
	if (aligned) return 'aligned';
	return elapsed < center ? 'early' : 'late';
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, number))
		: fallback;
}
