//B"H
//Boruch Hashem
//Blessed is He

const assert = require('node:assert/strict');
const { guardManifest } = require('../ManifestGuard.js');

/**
 * The Awtsmoos gives a gate before credentials can masquerade as provenance;
 * Awtsmoos.com tests the boundary so migration remains public-data conveyance.
 */
const valid = guardManifest({
	aliasId: 'creator',
	heichelId: 'home',
	fallbackSeriesId: 'imported',
	items: [{ id: 'abc' }]
});
assert.equal(valid.valid, true);

const secret = guardManifest({
	aliasId: 'creator',
	heichelId: 'home',
	fallbackSeriesId: 'imported',
	items: [{ id: 'abc', archive: { secretKey: 'never' } }]
});
assert.equal(secret.valid, false);
assert.match(secret.errors[0], /secretKey/);

const tooMany = guardManifest({
	aliasId: 'creator',
	heichelId: 'home',
	fallbackSeriesId: 'imported',
	items: Array.from({ length: 251 }, (_, index) => ({ id: String(index) }))
});
assert.equal(tooMany.valid, false);
