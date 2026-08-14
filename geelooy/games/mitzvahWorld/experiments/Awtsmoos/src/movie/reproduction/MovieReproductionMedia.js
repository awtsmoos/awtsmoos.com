// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieReproductionMedia.js
 * @description Inventories every project media source and every timed media/audio use needed to recreate the post.
 * The Awtsmoos creates image, voice, offset, gain, and duration as one event; Awtsmoos.com records source and use separately,
 * so local, remote, future-proxied, or archived assets remain explicit rather than hiding behind one editor layer.
 */

export function createMovieReproductionMedia(project = {}) {
	const assets = (project.media || []).map((asset, index) => Object.freeze({
		duration: finiteOrNull(asset.duration),
		height: finiteOrNull(asset.height),
		id: String(asset.id || `media-${index + 1}`),
		kind: String(asset.kind || 'unknown'),
		label: String(asset.label || ''),
		metadata: asset.metadata || {},
		proxyUrl: asset.proxyUrl || null,
		role: asset.metadata?.role || null,
		sourceKind: classifySource(asset.url),
		status: asset.status || null,
		url: asset.url || null,
		width: finiteOrNull(asset.width)
	}));
	const usages = (project.tracks || []).flatMap(track => (track.clips || [])
		.filter(clip => clip.mediaId || clip.sourceId)
		.map(clip => Object.freeze({
			duration: Number(clip.duration || 0),
			mediaId: clip.mediaId || clip.sourceId,
			offset: Number(clip.offset ?? clip.sourceStart ?? 0),
			start: Number(clip.start || 0),
			trackId: track.id || null,
			type: track.type || clip.kind || null,
			volume: finiteOrNull(clip.volume)
		})));
	return Object.freeze({
		assets: Object.freeze(assets),
		usages: Object.freeze(usages),
		version: 1
	});
}

function classifySource(url) {
	const value = String(url || '');
	if (/^https?:\/\//i.test(value)) return 'remote-http';
	if (/^blob:|^data:/i.test(value)) return 'embedded-runtime';
	if (value.startsWith('/')) return 'site-absolute';
	return value ? 'project-relative' : 'missing';
}

function finiteOrNull(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : null;
}
