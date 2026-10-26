//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DestinationSchema
 * @description
 * A destination is one exact chamber: Heichel, series, placement intention, and policy context.
 * The Awtsmoos keeps optional time truly optional, so immediate light is never mistaken for a scheduled gate.
 */

const PLACEMENT_KINDS = Object.freeze([
	'canonical',
	'reference',
	'repost',
	'quote',
	'excerpt',
	'syndication'
]);

function clean(value, maximum = 240) {
	return String(value || '')
		.replace(/[<>\u0000-\u001f]/g, '')
		.trim()
		.slice(0, maximum);
}

/** Normalize one optional scheduling value without turning absence into numeric zero. */
function normalizeOptionalTime(value) {
	if (value === null || value === undefined || value === '') return null;
	const numeric = Number(value);
	return Number.isFinite(numeric) ? numeric : null;
}

function normalizeDestination(value = {}, fallbackKind = 'canonical') {
	const kind = PLACEMENT_KINDS.includes(value.kind) ? value.kind : fallbackKind;
	return {
		heichelId: clean(value.heichelId || value.heichel, 120),
		seriesId: clean(value.seriesId || value.series || 'root', 120) || 'root',
		kind,
		note: clean(value.note, 1200),
		excerpt: clean(value.excerpt, 1800),
		startTime: normalizeOptionalTime(value.startTime),
		endTime: normalizeOptionalTime(value.endTime)
	};
}

function validateDestination(destination, { canonical = false } = {}) {
	const errors = [];
	if (!destination.heichelId) errors.push('heichelId is required.');
	if (!destination.seriesId) errors.push('seriesId is required.');
	if (canonical && destination.kind !== 'canonical') {
		errors.push('The primary destination must be canonical.');
	}
	if (!canonical && destination.kind === 'canonical') {
		errors.push('A secondary destination cannot be canonical.');
	}
	if (destination.startTime !== null && destination.startTime < 0) {
		errors.push('startTime cannot be negative.');
	}
	if (
		destination.startTime !== null
		&& destination.endTime !== null
		&& destination.endTime <= destination.startTime
	) {
		errors.push('endTime must be greater than startTime.');
	}
	return { valid: errors.length === 0, errors };
}

function destinationKey(value) {
	const destination = normalizeDestination(value, value.kind || 'reference');
	return [destination.heichelId, destination.seriesId, destination.kind].join(':');
}

function uniqueDestinations(values = []) {
	const destinations = new Map();
	for (const value of values.slice(0, 24)) {
		const destination = normalizeDestination(value, 'reference');
		if (!destination.heichelId) continue;
		destinations.set(destinationKey(destination), destination);
	}
	return [...destinations.values()];
}

module.exports = {
	PLACEMENT_KINDS,
	clean,
	destinationKey,
	normalizeDestination,
	normalizeOptionalTime,
	uniqueDestinations,
	validateDestination
};
