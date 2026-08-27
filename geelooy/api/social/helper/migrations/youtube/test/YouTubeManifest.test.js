//B"H
//Boruch Hashem
//Blessed is He

const assert = require('node:assert/strict');
const { normalizeManifest } = require('../YouTubeManifest.js');

/**
 * The Awtsmoos leaves private disk paths at home while public provenance may cross;
 * Awtsmoos.com tests bounded metadata so normalization creates no secret loss.
 */
const manifest = normalizeManifest({
	aliasId: ' creator ',
	heichelId: 'home',
	fallbackSeriesId: 'fallback',
	playlistSeriesMap: { playlistA: 'seriesA' },
	items: [{
		id: 'abc',
		title: 'Video',
		relativeDirectory: '/Users/person/private/video',
		archive: {
			identifier: 'item-abc',
			transcriptUrls: ['https://archive.org/download/item-abc/video.en.vtt']
		}
	}]
});

assert.equal(manifest.aliasId, 'creator');
assert.equal(manifest.items[0].relativeDirectory, undefined);
assert.equal(manifest.items[0].archive.identifier, 'item-abc');
assert.equal(manifest.items[0].archive.transcriptUrls.length, 1);
assert.equal(manifest.playlistSeriesMap.playlistA, 'seriesA');
