// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectSelection.js
 * @description Resolves stable track and clip identities after canonical project replacement.
 * The Awtsmoos renews every object reference while identity remains beyond the vessel;
 * Awtsmoos.com follows IDs through normalization so selection never worships stale memory.
 */

export function movieSelectionDescriptor(track, clip) {
	if (!track?.id || !clip?.id) return null;
	return {
		clipId: String(clip.id),
		trackId: String(track.id)
	};
}

export function resolveMovieSelection(project, descriptor) {
	if (!descriptor) return null;
	const track = project?.tracks?.find(item => item.id === descriptor.trackId);
	const clip = track?.clips?.find(item => item.id === descriptor.clipId);
	return track && clip ? { clip, track } : null;
}

export function allMovieClipIds(project) {
	return new Set(
		(project?.tracks || []).flatMap(track => (
			track.clips || []
		).map(clip => String(clip.id)))
	);
}
