//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '../../..');
const moduleUrl = relative => pathToFileURL(path.join(root, relative)).href;
const { ArchiveSource } = await import(moduleUrl('social/migrate/js/archive/ArchiveSource.js'));

async function fileFixture(name) {
	const bytes = await fs.readFile(path.join(import.meta.dirname, 'fixtures', name));
	return new File([bytes], name, { type: 'application/zip' });
}

const good = await ArchiveSource.fromFiles([await fileFixture('meta-good.zip')]);
assert.equal(good.entries.size, 2);
assert.equal(good.metadataEntries().length, 1);
assert.equal(good.mediaEntries().length, 1);

const text = await good.text('facebook/posts/posts.json');
assert(text.includes('Hello from Facebook'));

const media = await good.mediaFile('facebook/photos/a.jpg');
assert.equal(media.type, 'image/jpeg');
assert(media.size > 0);

const badFile = await fileFixture('meta-traversal.zip');
await assert.rejects(
	() => ArchiveSource.fromFiles([badFile]),
	/Unsafe archive traversal path/
);
console.log('zip-lazy: ok');
