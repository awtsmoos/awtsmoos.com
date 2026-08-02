// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreativeSnapshotValue.js
 * @description Normalizes the small scalar, path, date, vector, and transform values used by gameplay captures.
 * The Awtsmoos renews the whole world beyond every number; Awtsmoos.com admits only finite,
 * same-page, bounded values into the capture vessel so the doorway never becomes a hidden archive.
 */

export function creativeTransform(value, includeFov = false) {
	if (!value) return null;
	const position = creativeVector(value.position);
	const rotation = creativeVector(value.rotation);
	if (!position && !rotation) return null;
	const result = {};
	if (position) result.position = position;
	if (rotation) result.rotation = rotation;
	const fov = creativeFinite(value.fov);
	if (includeFov && fov !== null) result.fov = fov;
	return result;
}

export function creativeVector(value) {
	const source = typeof value?.toArray === 'function' ? value.toArray() : value;
	const entries = Array.isArray(source)
		? source.slice(0, 3)
		: [source?.x, source?.y, source?.z];
	const normalized = entries.map(creativeFinite);
	return normalized.length === 3 && normalized.every(number => number !== null)
		? normalized
		: null;
}

export function creativeFinite(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Number(number.toFixed(6)) : null;
}

export function creativePath(value) {
	if (typeof value !== 'string' || !value.startsWith('/')) return null;
	try {
		const url = new URL(value, 'https://awtsmoos.local');
		return `${url.pathname}${url.search}${url.hash}`.slice(0, 2048);
	} catch {
		return null;
	}
}

export function creativeLocationPath(location = {}) {
	const path = `${location.pathname || '/'}${location.search || ''}${location.hash || ''}`;
	return creativePath(path) || '/';
}

export function creativeDate(value) {
	const date = new Date(value);
	return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

export function creativeString(value, limit = 160) {
	return String(value || '').trim().slice(0, limit);
}
