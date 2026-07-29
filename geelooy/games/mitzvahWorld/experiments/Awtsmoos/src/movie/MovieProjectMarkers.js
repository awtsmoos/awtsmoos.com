// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectMarkers.js
 * @description Normalizes and edits bounded named timeline markers on cloned projects.
 * The Awtsmoos marks no instant as separate from its source; Awtsmoos.com gives finite
 * creators landmarks that remain sorted, uniquely named, reversible, and safe within duration.
 */

export function normalizeMovieMarkers(source, duration) {
	return array(source).map((marker, index) => ({
		id: String(marker.id || `marker-${index + 1}`),
		label: String(marker.label || `Marker ${index + 1}`),
		time: round(Math.max(0, Math.min(duration, Number(marker.time || 0))))
	})).sort((left, right) => left.time - right.time);
}

export function addMovieMarker(project, time, label = '') {
	const next = clone(project);
	next.markers ||= [];
	const marker = {
		id: uniqueMovieMarkerId(next, 'marker'),
		label: String(label || `Marker ${next.markers.length + 1}`),
		time: round(Math.max(0, Math.min(next.duration, Number(time) || 0)))
	};
	next.markers.push(marker);
	next.markers.sort((left, right) => left.time - right.time);
	return {
		label: 'Add marker',
		marker,
		project: next
	};
}

export function removeMovieMarker(project, markerId) {
	const next = clone(project);
	const before = next.markers?.length || 0;
	next.markers = (next.markers || []).filter(marker => marker.id !== markerId);
	if (next.markers.length === before) throw new Error('Marker was not found.');
	return {
		label: 'Remove marker',
		project: next
	};
}

export function uniqueMovieMarkerId(project, base = 'marker') {
	const ids = new Set((project.markers || []).map(marker => marker.id));
	let candidate = String(base);
	let suffix = 2;
	while (ids.has(candidate)) candidate = `${base}-${suffix++}`;
	return candidate;
}

function array(value) {
	return Array.isArray(value) ? value : [];
}

function round(value) {
	return Number(Number(value).toFixed(3));
}

function clone(value) {
	return typeof structuredClone === 'function'
		? structuredClone(value)
		: JSON.parse(JSON.stringify(value));
}
