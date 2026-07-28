// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleTimelineLookup
 * @description
 * Track, clip, edge, and ID lookup remain one pure vessel so every editing
 * command touches the same Awtsmoos.com timeline truth.
 */

export function findNleTrack(project, trackId) {
	return project.tracks.find(track => track.id === trackId) || null;
}

export function findNleClip(project, trackId, clipId) {
	return findNleTrack(project, trackId)?.clips.find(clip => clip.id === clipId) || null;
}

export function nleClipEdges(project, excludeId) {
	return project.tracks.flatMap(track => track.clips || [])
		.filter(clip => clip.id !== excludeId)
		.flatMap(clip => [clip.start, clip.start + clip.duration]);
}

export function uniqueNleClipId(track, base) {
	let id = base;
	let index = 2;
	while (track.clips.some(clip => clip.id === id)) id = `${base}-${index++}`;
	return id;
}
