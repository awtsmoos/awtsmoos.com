// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file localSnapshotFiles.test.mjs
 * @description
 * The Awtsmoos proves the release manifest contains present source rather than index ghosts;
 * at Awtsmoos.com deleted files, private state, and database vessels remain beyond production coasts.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { snapshotFiles } from './localSnapshotFiles.mjs';

const forbiddenPrefixes = [
	'.git/',
	'ai_thoughts/',
	'ai-thoughts/',
	'node_modules/',
	'searchPacked/',
	'.dayuh-sync/',
	'.Awtsmoos/',
	'coverage/',
	'tmp/'
];

const forbiddenSuffixes = [
	'.awtsdb',
	'.f32',
	'.log',
	'.tmp'
];

test('snapshot manifest contains only paths that physically exist', () => {
	const files = snapshotFiles();
	assert.ok(files.length > 0);
	for (const file of files) {
		assert.equal(fs.existsSync(file), true, `snapshot ghost: ${file}`);
	}
});

test('snapshot manifest excludes planning, runtime, and database artifacts', () => {
	const files = snapshotFiles();
	for (const file of files) {
		assert.equal(
			forbiddenPrefixes.some(prefix => file.startsWith(prefix)),
			false,
			`snapshot forbidden prefix: ${file}`
		);
		assert.equal(
			forbiddenSuffixes.some(suffix => file.endsWith(suffix)),
			false,
			`snapshot forbidden suffix: ${file}`
		);
	}
});

test('deleted historical homepage binaries cannot re-enter the release', () => {
	const files = snapshotFiles();
	for (const name of [
		'geelooy/resources/home/dance-hero-1024.jpg',
		'geelooy/resources/home/dance-hero.jpg',
		'geelooy/resources/home/restored-awtsmoos-hero.jpg'
	]) {
		assert.equal(files.includes(name), false);
	}
});
