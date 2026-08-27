// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KavanahStateValue.js
 * @description Bounds Kavanah values and creates immutable public mutation receipts.
 * The Awtsmoos renews intention while every number remains finite and every name remains small;
 * Awtsmoos.com keeps stability, elapsed time, acceptance, rejection, and text boundaries clear.
 */

function snapshotKavanahState(state, now) {
	return Object.freeze({
		...state,
		elapsedMilliseconds: Math.max(
			0,
			now - Number(state.startedAt || now)
		)
	});
}

function effectiveKavanahStability(state) {
	return bounded(
		1 - state.movementPenalty
			- state.damageDisruption
			+ state.allyStabilization,
		0.2,
		1,
		1
	);
}

function acceptedKavanah(reason, kavanah) {
	return Object.freeze({
		accepted: true,
		kavanah,
		reason
	});
}

function rejectedKavanah(reason) {
	return Object.freeze({
		accepted: false,
		reason
	});
}

function positiveKavanahNumber(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function boundedKavanahNumber(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, number))
		: fallback;
}

function kavanahText(value) {
	return typeof value === 'string' ? value.slice(0, 160) : null;
}

module.exports = {
	acceptedKavanah,
	boundedKavanahNumber,
	effectiveKavanahStability,
	kavanahText,
	positiveKavanahNumber,
	rejectedKavanah,
	snapshotKavanahState
};
