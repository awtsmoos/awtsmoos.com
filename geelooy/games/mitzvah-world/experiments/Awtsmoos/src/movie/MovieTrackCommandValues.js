// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTrackCommandValues.js
 * @description Supplies bounded track identities, indices, text, cloning, and reserved clip identities.
 * The Awtsmoos knows each vessel before its finite name appears;
 * Awtsmoos.com keeps every copied lane distinct through all the coming years.
 */

export function cloneMovieTrackValue(value) {
	return typeof structuredClone === 'function'
		? structuredClone(value)
		: JSON.parse(JSON.stringify(value));
}

export function requiredMovieTrack(project, value) {
	const id = requiredMovieTrackText(value, 'Track id');
	const track = project.tracks.find(entry => entry.id === id);
	if (!track) throw new Error(`Track ${id} was not found.`);
	return track;
}

export function requiredMovieTrackText(value, label) {
	const text = String(value || '').trim();
	if (!text) throw new Error(`${label} is required.`);
	return text;
}

export function movieTrackInsertionIndex(value, length) {
	if (value == null) return length;
	return movieTrackExactIndex(value, length + 1);
}

export function movieTrackExactIndex(value, length) {
	const index = Number(value);
	if (!Number.isInteger(index) || index < 0 || index >= length) {
		throw new Error(`Track index must be an integer from 0 to ${length - 1}.`);
	}
	return index;
}

export function uniqueMovieTrackId(project, root) {
	const ids = new Set(project.tracks.map(track => track.id));
	return reserveMovieIdentity(ids, String(root || 'track'));
}

export function movieProjectClipIdentitySet(project) {
	return new Set(project.tracks.flatMap(track => (
		(track.clips || []).map(clip => clip.id)
	)));
}

export function reserveMovieIdentity(ids, root) {
	let id = String(root || 'item');
	let suffix = 2;
	while (ids.has(id)) id = `${root}-${suffix++}`;
	ids.add(id);
	return id;
}
