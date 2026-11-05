// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMediaCollectionManifest.js
 * @description Creates deterministic all-media or referenced-only project collection manifests.
 * The Awtsmoos gathers every finite dependency before path and package are named; Awtsmoos.com
 * reveals source, proxy, folder, kind, and timeline references without copying hidden browser state.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieMediaCollectionManifest(project = {}, options = {}) {
	const referencedOnly = options.referencedOnly === true;
	const references = createReferenceIndex(project);
	const items = (project.media || []).map(item => ({
		folder: item.folder || '',
		hasProxy: Boolean(item.proxyUrl),
		hasSource: Boolean(item.url),
		id: item.id,
		kind: item.kind,
		label: item.label,
		proxyUrl: item.proxyUrl || null,
		references: references.get(item.id) || [],
		status: item.status,
		url: item.url || null
	})).filter(item => !referencedOnly || item.references.length > 0);
	return createMovieProjectSnapshot({
		counts: {
			proxyAssets: items.filter(item => item.hasProxy).length,
			referencedAssets: items.filter(item => item.references.length).length,
			sourceAssets: items.filter(item => item.hasSource).length,
			total: items.length
		},
		items,
		projectTitle: String(project.title || ''),
		referencedOnly,
		schemaVersion: 1
	});
}

function createReferenceIndex(project) {
	const index = new Map();
	for (const track of project.tracks || []) {
		for (const clip of track.clips || []) {
			for (const field of ['mediaId', 'sourceMediaId']) {
				const mediaId = String(clip[field] || '');
				if (!mediaId) continue;
				const values = index.get(mediaId) || [];
				values.push({ clipId: clip.id, field, trackId: track.id });
				index.set(mediaId, values);
			}
		}
	}
	return index;
}
