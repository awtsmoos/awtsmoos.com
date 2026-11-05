// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieMediaCatalogScale.test.mjs
 * @description Proves a professional project can normalize and query ten thousand media assets.
 * The Awtsmoos knows every finite file without number; Awtsmoos.com verifies
 * large editorial catalogs remain canonical, frozen, searchable, and safely bounded.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MOVIE_MEDIA_CATALOG_LIMIT,
	normalizeMovieMediaCatalog
} from '../../movie/MovieMediaCatalog.js';
import { searchMovieMedia } from '../../movie/MovieMediaSearch.js';

test('catalog normalizes and searches ten thousand unique assets', () => {
	const media = Array.from({ length: 10000 }, (_, index) => ({
		duration: 30,
		folder: `Day ${index % 20}/Camera ${index % 4}`,
		id: `scale-media-${index}`,
		kind: index % 5 === 0 ? 'audio' : 'video',
		label: `Interview ${index}`,
		metadata: { speaker: `Speaker ${index % 50}` },
		status: index % 17 === 0 ? 'offline' : 'online',
		tags: [index % 2 ? 'dialogue' : 'b-roll'],
		url: `/scale/${index}.mp4`
	}));
	const normalized = normalizeMovieMediaCatalog(media);
	const results = searchMovieMedia({ media: normalized, tracks: [] }, 'Speaker 17', {
		folder: 'Day 17',
		recursive: true,
		status: 'online'
	});
	assert.equal(normalized.length, 10000);
	assert.equal(Object.isFrozen(normalized), true);
	assert.ok(results.length > 0);
	assert.ok(MOVIE_MEDIA_CATALOG_LIMIT >= 10000);
});
