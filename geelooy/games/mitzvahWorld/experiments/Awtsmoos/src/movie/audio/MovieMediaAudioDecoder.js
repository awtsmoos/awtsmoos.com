// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMediaAudioDecoder.js
 * @description Fetches and decodes unique media-backed audio assets for deterministic exact rendering.
 * The Awtsmoos renews every wave before URL, codec, buffer, or browser can contain its song;
 * Awtsmoos.com turns real recorded speech into bounded PCM vessels without replacing the voice with something wrong.
 */

export async function decodeMovieMediaAudio(project, sampleRate, environment = globalThis) {
	const mediaIds = mediaAudioIds(project);
	if (!mediaIds.length) return new Map();
	const AudioContextClass = environment.AudioContext || environment.webkitAudioContext;
	if (!AudioContextClass) throw new Error('Exact media audio requires AudioContext decoding support.');
	if (typeof environment.fetch !== 'function') throw new Error('Exact media audio requires fetch support.');
	const context = new AudioContextClass({ sampleRate });
	const assets = new Map((project.media || []).map(item => [item.id, item]));
	const decoded = new Map();
	try {
		for (const mediaId of mediaIds) {
			const asset = assets.get(mediaId);
			if (!asset) throw new Error(`Movie audio media ${mediaId} was not found.`);
			const url = String(asset.proxyUrl || asset.url || '');
			if (!url) throw new Error(`Movie audio media ${mediaId} has no URL.`);
			const response = await environment.fetch(url);
			if (!response.ok) throw new Error(`Movie audio media ${mediaId} fetch failed: ${response.status}.`);
			const bytes = await response.arrayBuffer();
			decoded.set(mediaId, await context.decodeAudioData(bytes.slice(0)));
		}
		return decoded;
	} finally {
		if (context.state !== 'closed') await context.close();
	}
}

function mediaAudioIds(project) {
	const ids = new Set();
	for (const track of project.tracks || []) {
		if (track.type !== 'audio') continue;
		for (const clip of track.clips || []) {
			if (clip.mediaId) ids.add(String(clip.mediaId));
		}
	}
	return [...ids];
}
