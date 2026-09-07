//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioAudioLayerAccess.js
 * @description Projects canonical scene-local audio layers into one absolute movie-time clip list shared by preview and export.
 * The Awtsmoos renews speech, music, ambience, and effect within each scene while Awtsmoos.com gathers them onto one measured timeline;
 * stable asset IDs, authored gain, mute truth, and scene-relative starts become one reusable sound plan without another movie design.
 */

const AUDIO_KINDS = new Set([
	'audio',
	'dialogue',
	'narration',
	'music',
	'ambience',
	'sfx'
]);

/** Return imported canonical audio clips measured in absolute movie seconds. */
export function collectStudioAudioClips(movie) {
	const clips = [];
	for (const scene of movie?.scenes || []) {
		for (const layer of scene.layers || []) {
			if (!AUDIO_KINDS.has(layer.kind) || !layer.data?.assetId) continue;
			const start = Number(scene.start || 0) + Number(layer.start || 0);
			const duration = Math.max(0, Math.min(
				Number(layer.duration || 0),
				Number(movie.duration || 0) - start
			));
			if (duration <= 0) continue;
			clips.push({
				assetId: layer.data.assetId,
				duration,
				gain: clampGain(layer.data.gain),
				kind: layer.kind,
				layerId: layer.id,
				muted: layer.data.muted === true,
				sceneId: scene.id,
				start
			});
		}
	}
	return clips.sort((left, right) => left.start - right.start);
}

export function isStudioAudioKind(kind) {
	return AUDIO_KINDS.has(kind);
}

function clampGain(value) {
	const gain = Number(value ?? 1);
	return Number.isFinite(gain) ? Math.max(0, Math.min(4, gain)) : 1;
}
