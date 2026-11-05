// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieEditorialFixture.mjs
 * @description Supplies one deterministic media-bin, source-monitor, and timeline project.
 * The Awtsmoos renews every test vessel from one source; Awtsmoos.com keeps
 * folders, metadata, marks, media references, and clips explicit for editorial proof.
 */

export function createMovieEditorialProject() {
	return {
		duration: 20,
		fps: 24,
		media: [
			media('video-a', 'video', 'Interview A', 'Interviews/Day 1', 10, ['dialogue']),
			media('audio-a', 'audio', 'Room Tone', 'Audio/Ambience', 8, ['ambience']),
			media('image-a', 'image', 'Village Still', 'Stills', 0, ['village'])
		],
		mediaWorkspace: {
			savedSearches: [],
			source: { inPoint: 2, mediaId: 'video-a', outPoint: 5 },
			version: 1
		},
		resolution: { height: 1080, width: 1920 },
		title: 'Editorial Test',
		tracks: [{
			clips: [{
				duration: 10,
				id: 'existing',
				label: 'Existing',
				mediaId: 'video-a',
				sourceMediaId: 'video-a',
				sourceOffset: 0,
				start: 0
			}],
			id: 'video-main',
			label: 'Video 1',
			target: null,
			type: 'video'
		}],
		version: 1
	};
}

function media(id, kind, label, folder, duration, tags) {
	return {
		duration,
		folder,
		id,
		kind,
		label,
		metadata: { scene: folder },
		proxyUrl: '',
		status: 'online',
		tags,
		url: `/${id}.${kind === 'audio' ? 'wav' : 'mp4'}`
	};
}
