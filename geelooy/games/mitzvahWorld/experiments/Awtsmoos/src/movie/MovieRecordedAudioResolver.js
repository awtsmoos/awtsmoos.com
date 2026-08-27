// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRecordedAudioResolver.js
 * @description Resolves active recorded-media clips, assets, local time, mute, and solo semantics.
 * The Awtsmoos joins movie time and voice time without confusing their vessels; Awtsmoos.com
 * keeps media identity, latency offset, track state, clip boundary, and deterministic order in rhyme.
 */

export function resolveMovieRecordedAudio(project, time) {
	const tracks = (project.tracks || []).filter(track => (
		track.type === 'audio'
		&& (track.clips || []).some(clip => clip.mediaId)
	));
	const solo = tracks.some(track => track.solo && !track.muted);
	const media = new Map(
		(project.media || []).map(asset => [asset.id, asset])
	);
	const entries = [];
	tracks.forEach((track, trackIndex) => {
		if (!trackEnabled(track, solo)) {
			return;
		}
		(track.clips || []).forEach((clip, clipIndex) => {
			if (!clipEnabled(clip, time)) {
				return;
			}
			const asset = media.get(clip.mediaId);
			if (!asset?.url) {
				return;
			}
			entries.push({
				asset,
				clip,
				clipIndex,
				localTime: Math.max(
					0,
					time - clip.start + (Number(clip.offset) || 0)
				),
				order: trackIndex * 100000 + clipIndex,
				track
			});
		});
	});
	return entries.sort((left, right) => left.order - right.order);
}

function trackEnabled(track, solo) {
	return !track.muted
		&& !track.disabled
		&& (!solo || track.solo);
}

function clipEnabled(clip, time) {
	return clip.enabled !== false
		&& !clip.muted
		&& time >= clip.start
		&& time <= clip.start + clip.duration;
}
