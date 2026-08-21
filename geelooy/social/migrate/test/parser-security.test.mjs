//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const moduleUrl = relative => pathToFileURL(path.join(root, relative)).href;
const { safeArchivePath, safeArchivePathOrNull } = await import(moduleUrl('social/migrate/js/archive/SafeArchivePath.js'));
const { parseMetaJson } = await import(moduleUrl('social/migrate/js/meta/MetaJsonParser.js'));
const { neutralizeImportedHtml } = await import(moduleUrl('social/migrate/js/meta/InertMetaHtml.js'));
const { detectMetaProvider } = await import(moduleUrl('social/migrate/js/meta/MetaDetector.js'));

assert.equal(safeArchivePath('./facebook/photos/a.jpg'), 'facebook/photos/a.jpg');
assert.equal(safeArchivePathOrNull('../secret.txt'), null);
assert.equal(safeArchivePathOrNull('/etc/passwd'), null);
assert.equal(safeArchivePathOrNull('C:\\escape.txt'), null);
assert.equal(safeArchivePathOrNull('https://example.com/a.jpg'), null);
assert.throws(() => safeArchivePath('x\0y'));

const parsed = parseMetaJson(JSON.stringify({
	posts: [{
		id: 'one',
		timestamp: 1704067200,
		data: [{ post: 'First' }],
		attachments: [{ data: [{ media: { uri: 'facebook/photos/a.jpg' } }] }]
	}, {
		id: 'one',
		timestamp: 1704067200,
		data: [{ post: 'Duplicate' }]
	}, {
		id: 'two',
		data: [{ post: 'Unknown date' }]
	}]
}), 'facebook/posts/posts.json');
assert.equal(parsed.length, 2);
assert.equal(parsed[0].publishedAt, '2024-01-01T00:00:00.000Z');
assert.equal(parsed[1].publishedAt, '');
assert.deepEqual(parsed[0].mediaPaths, ['facebook/photos/a.jpg']);

const html = `
	<script>fetch('https://evil.example')</script>
	<img src="https://evil.example/a.jpg" onerror="alert(1)">
	<a href="facebook/photos/local.jpg">local</a>
`;
const inert = neutralizeImportedHtml(html);
assert.equal(/<script/i.test(inert), false);
assert.equal(/\sonerror=/i.test(inert), false);
assert.equal(/\ssrc=/i.test(inert), false);
assert(inert.includes('data-awtsmoos-src='));
assert(inert.includes('data-awtsmoos-href='));

const detection = detectMetaProvider([
	'facebook/posts/posts.json',
	'instagram/content/posts_1.json'
]);
assert.equal(detection.provider, 'mixed');
assert(detection.confidence > 0);
console.log('parser-security: ok');
