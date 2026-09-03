// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicStaticMetadata.test.mjs
 * @description
 * The Awtsmoos tests quoted metadata and the site's root vessel together, so B'H remains whole and `/` can receive its canonical light;
 * Awtsmoos.com carries entities through build-time reading while root and nested public pages map to the exact files in sight.
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import {
	authoredDescription,
	publicStaticPageRecords,
	relativeFile
} from '../../scripts/seo/publicStaticPageMetadata.mjs';

const doubleQuoted = '<meta name="description" content="B\'H — Light &amp; truth">';
const singleQuoted = '<meta content=\'B"H — Light &amp; truth\' name=\'description\'>';
assert.equal(authoredDescription(doubleQuoted), "B'H — Light & truth");
assert.equal(authoredDescription(singleQuoted), 'B"H — Light & truth');
assert.equal(relativeFile('/'), 'index.html');
assert.equal(relativeFile('/docs/'), 'docs/index.html');

const records = publicStaticPageRecords(path.resolve('geelooy'));
const home = records.find(record => record.filePath === 'index.html');
const docs = records.find(record => record.filePath === 'docs/index.html');
assert.ok(home);
assert.equal(home.canonicalPath, '/');
assert.equal(home.title, 'Awtsmoos — Torah, Creation & Living Worlds');
assert.ok(home.description.includes('Learn Torah in the living Heichel'));
assert.ok(docs);
assert.equal(docs.description, "B'H — Learn, search, explore every API, project boundary, and Data/Security/Realtime system in Awtsmoos.com.");
console.log('PUBLIC_STATIC_METADATA_REGRESSION_PASS');
