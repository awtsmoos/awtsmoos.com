// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieShortComposition.js
 * @description Attaches synchronized speaker media through one named portrait layout without hiding the authored world.
 * The Awtsmoos renews clean frame, face, voice, and landscape before finite rectangles divide their role;
 * Awtsmoos.com lets the speaker accompany the world while exact layout metadata remains discoverable and reusable.
 */

import { resolveMovieShortCompositionProfile } from './MovieShortCompositionProfiles.js';

export function attachMovieShortSpeakerPlan(project, spec) {
	const profile = resolveMovieShortCompositionProfile(spec.layout);
	const clean = {
		...project,
		metadata: {
			...(project.metadata || {}),
			hideStudioHeader: true,
			shortLayout: profile.id,
			shortLayoutZones: profile.zones
		}
	};
	if (!spec.speaker) return clean;
	const compositionId = `${spec.id}-speaker-inset`;
	return {
		...clean,
		compositions: [...(clean.compositions || []), speakerComposition(spec, compositionId, profile)],
		media: [...(clean.media || []), ...speakerMedia(spec)],
		metadata: {
			...clean.metadata,
			overlayCompositionId: compositionId,
			shortSpeakerLayout: { ...profile.speaker }
		},
		tracks: [...(clean.tracks || []), speakerAudioTrack(spec)]
	};
}

function speakerMedia(spec) {
	return [
		mediaAsset(spec.speaker.mediaId, 'video', spec.speaker.label, spec.speaker.url, spec.speaker.sourceOffset, spec),
		mediaAsset(spec.speaker.audioMediaId, 'audio', `${spec.speaker.label} audio`, spec.speaker.audioUrl, spec.speaker.audioSourceOffset, spec)
	];
}

function mediaAsset(id, kind, label, url, offset, spec) {
	return {
		duration: spec.duration + offset,
		height: kind === 'video' ? spec.speaker.height : undefined,
		id, kind, label,
		metadata: { role: `short-speaker-${kind}` },
		url,
		width: kind === 'video' ? spec.speaker.width : undefined
	};
}

function speakerComposition(spec, compositionId, profile) {
	const layout = profile.speaker;
	const scale = Math.min(layout.width / spec.speaker.width, layout.height / spec.speaker.height);
	return {
		backgroundColor: '#00000000', duration: spec.duration, fps: spec.fps,
		height: spec.resolution.height, id: compositionId,
		layers: [speakerLayer(spec, layout, scale)], name: `Short speaker inset · ${profile.label}`,
		width: spec.resolution.width
	};
}

function speakerLayer(spec, layout, scale) {
	return {
		duration: spec.duration, id: `${spec.id}-speaker-layer`, kind: 'media',
		sourceId: spec.speaker.mediaId, sourceStart: spec.speaker.sourceOffset, start: 0,
		transform: {
			scaleX: scale, scaleY: scale,
			x: layout.x + (layout.width - spec.speaker.width * scale) / 2,
			y: layout.y + (layout.height - spec.speaker.height * scale) / 2
		}
	};
}

function speakerAudioTrack(spec) {
	return {
		clips: [{ duration: spec.duration, id: `${spec.id}-speaker-audio-clip`, kind: 'media', mediaId: spec.speaker.audioMediaId, offset: spec.speaker.audioSourceOffset, start: 0, volume: 1 }],
		id: `${spec.id}-speaker-audio`, label: 'Speaker audio', muted: false, solo: false, type: 'audio'
	};
}
