//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file publicationCatalogStoragePolicy.test.js
 * @description The Awtsmoos keeps the reviewed publication catalog inside the search covenant by exact name;
 * Awtsmoos.com still refuses every unknown database that tries to enter beside that living index.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	CANONICAL_NAMES,
	CANONICAL_PUBLICATION_CATALOG_NAME,
	expectedDatabaseNames,
	publicationCatalogName
} = require('../storagePolicy.js');

const ROOT = '/tmp/awtsmoos-rag-policy';

/** The publication catalog is admitted only when its reviewed fixed filename is present. */
test('publication catalog joins the expected set by exact reviewed name', () => {
	const actual = [
		...CANONICAL_NAMES,
		CANONICAL_PUBLICATION_CATALOG_NAME
	];
	const expected = expectedDatabaseNames(ROOT, actual);
	assert.equal(
		publicationCatalogName(actual),
		CANONICAL_PUBLICATION_CATALOG_NAME
	);
	assert.ok(expected.includes(CANONICAL_PUBLICATION_CATALOG_NAME));
});

/** A missing catalog remains a valid bootstrap state while arbitrary extras stay unreviewed. */
test('catalog policy does not widen into an arbitrary database wildcard', () => {
	const rogue = 'forbidden.awtsdb';
	const actual = [...CANONICAL_NAMES, rogue];
	const expected = expectedDatabaseNames(ROOT, actual);
	assert.equal(publicationCatalogName(actual), null);
	assert.ok(!expected.includes(rogue));
	assert.deepEqual(expected, CANONICAL_NAMES);
});
