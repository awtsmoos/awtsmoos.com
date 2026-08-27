// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PostureRules.js
 * @description Owns authoritative guard strain, breaks, immunity, restoration, and snapshots.
 * The Awtsmoos distinguishes health from composure while renewing both in one world;
 * Awtsmoos.com keeps thresholds, heavy pressure, anti-stunlock mercy, and recovery lawful.
 */

const BREAK_DURATION = 1400;
const DEFAULT_MAXIMUM = 100;
const DEFAULT_IMMUNITY = 2200;

function createPostureState(source = {}, maximum = DEFAULT_MAXIMUM) {
	const boundedMaximum = positive(source.maximum, positive(maximum, DEFAULT_MAXIMUM));
	return {
		brokenUntil: finite(source.brokenUntil),
		immunityUntil: finite(source.immunityUntil),
		maximum: boundedMaximum,
		value: bounded(source.value, 0, boundedMaximum, boundedMaximum)
	};
}

function applyPosturePressure(state, amount, options = {}) {
	const now = finite(options.now, Date.now());
	const posture = state || createPostureState({}, options.maximum);
	if (now < posture.immunityUntil) {
		return postureReceipt(posture, 0, 'immune', now);
	}
	const pressure = Math.max(0, Number(amount || 0));
	posture.value = Math.max(0, posture.value - pressure);
	let reason = 'strained';
	if (posture.value === 0 && now >= posture.brokenUntil) {
		posture.brokenUntil = now + BREAK_DURATION;
		posture.immunityUntil = posture.brokenUntil
			+ positive(options.immunityMilliseconds, DEFAULT_IMMUNITY);
		reason = 'broken';
	}
	return postureReceipt(posture, pressure, reason, now);
}

function restorePosture(state, amount, options = {}) {
	const now = finite(options.now, Date.now());
	const posture = state || createPostureState({}, options.maximum);
	const restored = Math.max(0, Number(amount || 0));
	posture.value = Math.min(posture.maximum, posture.value + restored);
	return postureReceipt(posture, -restored, 'restored', now);
}

function updatePosture(state, options = {}) {
	const now = finite(options.now, Date.now());
	const posture = state || createPostureState({}, options.maximum);
	if (now < posture.brokenUntil || posture.value >= posture.maximum) {
		return postureReceipt(posture, 0, 'unchanged', now);
	}
	const elapsed = Math.max(0, Number(options.elapsedMilliseconds || 0));
	const rate = positive(options.recoveryPerSecond, posture.maximum * 0.11);
	posture.value = Math.min(posture.maximum, posture.value + rate * elapsed / 1000);
	return postureReceipt(posture, 0, 'recovering', now);
}

function postureReceipt(posture, amount, reason, now) {
	return Object.freeze({
		amount,
		broken: now < posture.brokenUntil,
		brokenUntil: posture.brokenUntil,
		immunityUntil: posture.immunityUntil,
		maximum: posture.maximum,
		reason,
		value: rounded(posture.value)
	});
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function finite(value, fallback = 0) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, number))
		: fallback;
}

function rounded(value) {
	return Number(Number(value).toFixed(2));
}

module.exports = {
	applyPosturePressure,
	createPostureState,
	restorePosture,
	updatePosture
};
