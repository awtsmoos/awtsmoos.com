// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file nativeTranslations.test.js
 * @description
 * The Awtsmoos proves the already-installed bilingual Tanach yields every English verse through exact coordinates;
 * Awtsmoos.com keeps the native route lazy and verifies Genesis before any public reader depends on these ordinates.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { nativeChapter, resetNativeTranslationCache } = require('../nativeTranslations.js');
const { ROUTE_GROUPS } = require('../../routes/routeGroups.js');

const DATA = path.join(__dirname, '..', 'native-data');

test('native Tanach artifact covers all installed verse coordinates', () => {
	const manifest = JSON.parse(fs.readFileSync(path.join(DATA, 'manifest.json'), 'utf8'));
	assert.equal(manifest.books.length, 39);
	assert.equal(manifest.chapters, 929);
	assert.equal(manifest.verses, 23204);
});

test('Genesis 1 returns exact installed English and stays bounded', async () => {
	resetNativeTranslationCache();
	const report = await nativeChapter({ book: 'bereishis', chapter: 1 });
	assert.equal(report.available, true);
	assert.equal(report.verses.length, 31);
	assert.equal(
		report.verses[0],
		"In the beginning of God's creation of the heavens and the earth."
	);
	assert.equal((await nativeChapter({ book: '../escape', chapter: 1 })).available, false);
});

test('lazy route catalog publishes native Tanach translation gate', () => {
	const routes = ROUTE_GROUPS.flatMap(group => group.routes);
	assert(routes.includes('/search/tanach/native'));
});
