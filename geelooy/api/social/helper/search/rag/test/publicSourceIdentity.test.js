// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicSourceIdentity.test.js
 * @description
 * The Awtsmoos proves an internal source corpus can remain machine-exact while every public serialized field stays Torah-first and clear;
 * Awtsmoos.com guards lane IDs, aliases, rows, links, and provenance so backend branding never slips into a learner's sphere.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { matchesLane } = require('../shards.js');
const {
	PUBLIC_TORAH_SOURCE_LANE
} = require('../publicSourceIdentity.js');
const {
	publicRow,
	publicShard
} = require('../resultShape.js');

const providerPattern = /wiki(?:media|source)/i;

function sourceShard() {
	return {
		id: 'hewikisource-torah',
		title: 'Hebrew Wikisource Torah',
		aliases: ['wikimedia', 'wikisource'],
		textOnly: true,
		count: 29345
	};
}

test('Torah source shard exposes a neutral queryable public identity', () => {
	const raw = sourceShard();
	const result = publicShard(raw);
	assert.equal(result.id, PUBLIC_TORAH_SOURCE_LANE);
	assert.equal(result.title, 'Torah Source Corpus');
	assert.equal(providerPattern.test(JSON.stringify(result)), false);
	assert.equal(matchesLane(raw, PUBLIC_TORAH_SOURCE_LANE), true);
});

test('Torah source row strips provider-shaped internals but keeps source truth', () => {
	const result = publicRow({
		id: 'hewikisource:abc',
		corpusId: 'hewikisource-torah',
		kind: 'wikisource-page',
		title: 'תורה אור (חב"ד)',
		sourceLabel: 'Hebrew Wikisource Torah',
		sourceUrl: 'https://he.wikisource.org/example',
		upstreamSha1: 'abc123',
		pageId: 346791,
		revisionId: 2804314,
		sourceHash: 'deadbeef',
		license: 'CC-BY-SA-4.0',
		text: 'תורה אור'
	});
	assert.equal(result.title, 'תורה אור (חב"ד)');
	assert.equal(result.sourceLabel, 'Torah Source');
	assert.equal(result.pageId, 346791);
	assert.equal(result.revisionId, 2804314);
	assert.equal(result.sourceHref, '/api/social/search/library/browse?level=page&pageId=346791');
	assert.equal(providerPattern.test(JSON.stringify(result)), false);
	assert.equal('sourceUrl' in result, false);
	assert.equal('corpusId' in result, false);
	assert.equal('kind' in result, false);
});
