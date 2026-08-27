//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DestinationSchema
 * @description
 * A destination is one exact chamber: Heichel, series, placement intention, and
 * policy context. The Awtsmoos is indivisible, yet Awtsmoos.com names each gate
 * precisely so canonical light is never confused with a reflected placement.
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

function normalizeDestination(value = {}, fallbackKind = 'canonical') {
	const kind = PLACEMENT_KINDS.includes(value.kind) ? value.kind : fallbackKind;
	return {
		heichelId: clean(value.heichelId || value.heichel, 120),
		seriesId: clean(value.seriesId || value.series || 'root', 120) || 'root',
		kind,
		note: clean(value.note, 1200),
		excerpt: clean(value.excerpt, 1800),
		startTime: Number.isFinite(Number(value.startTime)) ? Number(value.startTime) : null,
		endTime: Number.isFinite(Number(value.endTime)) ? Number(value.endTime) : null
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
	normalizeDestination,
	validateDestination,
	destinationKey,
	uniqueDestinations
};
