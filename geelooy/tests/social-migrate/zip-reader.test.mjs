//B"H
//Boruch Hashem
//Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ArchiveSource } from '../../social/migrate/js/archive/ArchiveSource.js';

const fixture = new URL('./fixtures/meta-good.zip', import.meta.url);
const traversal = new URL('./fixtures/meta-traversal.zip', import.meta.url);

async function archiveFrom(url, name) {
	const bytes = await readFile(url);
	return ArchiveSource.fromFiles([new File([bytes], name, { type: 'application/zip' })]);
}

test('deflated ZIP reads central directory and inflates only requested entries', async () => {
	const source = await archiveFrom(fixture, 'meta-good.zip');
	assert.equal(source.metadataEntries().length, 1);
	assert.equal(source.mediaEntries().length, 1);
	const text = await source.text('facebook/posts/your_posts.json');
	assert.match(text, /Hello from Facebook/);
	const media = await source.mediaFile('facebook/media/photo.jpg');
	assert.equal(media.type, 'image/jpeg');
	assert.ok(media.size > 0);
});

test('ZIP central directory rejects traversal before entry lookup', async () => {
	await assert.rejects(
		archiveFrom(traversal, 'meta-traversal.zip'),
		/Unsafe archive traversal path/
	);
});

test('ZIP source never resolves an escaping request', async () => {
	const source = await archiveFrom(fixture, 'meta-good.zip');
	assert.throws(() => source.resolve('../facebook/media/photo.jpg'));
});
