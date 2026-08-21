//B"H
//Boruch Hashem
//Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { safeArchivePath } from '../../social/migrate/js/archive/SafeArchivePath.js';
import { parseMetaJson } from '../../social/migrate/js/meta/MetaJsonParser.js';
import { detectMetaProvider, providerForPath } from '../../social/migrate/js/meta/MetaDetector.js';
import { neutralizeImportedHtml } from '../../social/migrate/js/meta/InertMetaHtml.js';

test('archive paths reject traversal, roots, schemes, drives, and NUL', () => {
	for (const value of [
		'../x.json',
		'/x.json',
		'C:/x.json',
		'a/../../x',
		'https://cdn.example/x.jpg',
		'a\0b'
	]) {
		assert.throws(() => safeArchivePath(value));
	}
	assert.equal(safeArchivePath('./facebook/posts/a.json'), 'facebook/posts/a.json');
});

test('Meta JSON dedupes, preserves unknown dates, and maps local media', () => {
	const record = {
		id: 'same',
		text: 'Remember this',
		attachments: [{ media: { uri: 'instagram/media/a.jpg' } }]
	};
	const parsed = parseMetaJson(JSON.stringify([record, record]), 'instagram/content/posts_1.json');
	assert.equal(parsed.length, 1);
	assert.equal(parsed[0].provider, 'instagram');
	assert.equal(parsed[0].publishedAt, '');
	assert.deepEqual(parsed[0].mediaPaths, ['instagram/media/a.jpg']);
	assert.notEqual(parsed[0].publishedAt, new Date(0).toISOString());
});

test('Meta JSON ignores unsafe or remote media paths without rejecting the memory', () => {
	const parsed = parseMetaJson(JSON.stringify([{
		text: 'Safe words',
		attachments: [
			{ media: { uri: '../outside.jpg' } },
			{ media: { uri: 'https://cdn.example/remote.jpg' } }
		]
	}]), 'facebook/posts/posts.json');
	assert.equal(parsed.length, 1);
	assert.deepEqual(parsed[0].mediaPaths, []);
});

test('provider detection distinguishes mixed archives and per-file source', () => {
	const detection = detectMetaProvider([
		'facebook/your_facebook_activity/posts.json',
		'instagram/content/posts/media.json'
	]);
	assert.equal(detection.provider, 'mixed');
	assert.equal(providerForPath('instagram/content/posts/media.json'), 'instagram');
	assert.equal(providerForPath('unknown/export.json', 'facebook'), 'facebook');
});

test('HTML neutralization removes executable behavior but keeps inert path evidence', () => {
	const input = '<article onclick="evil()"><script>bad()</script><img src="media/a.jpg"><a href="https://example.com/x">x</a></article>';
	const output = neutralizeImportedHtml(input);
	assert.doesNotMatch(output, /<script/i);
	assert.doesNotMatch(output, /\sonclick\s*=/i);
	assert.doesNotMatch(output, /\ssrc\s*=/i);
	assert.doesNotMatch(output, /\shref\s*=/i);
	assert.match(output, /data-awtsmoos-src="media\/a\.jpg"/);
	assert.match(output, /data-awtsmoos-href="https:\/\/example\.com\/x"/);
});
