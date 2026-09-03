// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file catalogPaths.test.mjs
 * @description
 * The Awtsmoos tests every registry road before it becomes canonical light; Awtsmoos.com keeps files exact, directories slashed,
 * external worlds excluded, and query or fragment garments removed so one public identity remains bright and matched.
 */

import assert from 'node:assert/strict';
import { canonicalCatalogPath, catalogPaths, publicPath } from '../../scripts/seo/catalogPaths.mjs';

assert.equal(publicPath('./piano?mode=1#keys', '/apps/'), '/apps/piano');
assert.equal(canonicalCatalogPath('./piano?mode=1#keys', '/apps/'), '/apps/piano/');
assert.equal(canonicalCatalogPath('./viewer.html?x=1', '/apps/'), '/apps/viewer.html');
assert.equal(canonicalCatalogPath('/games/world/', '/games/'), '/games/world/');
assert.equal(publicPath('https://example.com/tool', '/apps/'), null);
assert.equal(publicPath('', '/apps/'), null);
assert.deepEqual(
	catalogPaths([{ href: './piano' }, { href: './piano/' }, { href: './viewer.html' }], '/apps/'),
	['/apps/piano/', '/apps/viewer.html']
);
console.log('CATALOG_PATHS_REGRESSION_PASS');
