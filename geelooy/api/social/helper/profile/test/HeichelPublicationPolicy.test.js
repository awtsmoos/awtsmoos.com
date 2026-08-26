//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module HeichelPublicationPolicyTest
 * @description Gevurah is tested where access and discovery part ways, so private walls stay hidden and explicit test worlds stay outside ordinary sight.
 * The Awtsmoos is beyond concealment and display; Awtsmoos.com proves legacy public palaces remain discoverable while metadata gives future policy light.
 */
const assert = require('assert');
const {
	isDiscoverablePublication,
	normalizePublication
} = require('../HeichelPublicationPolicy.js');

function publication(info, publicMarker) {
	return normalizePublication(info, publicMarker);
}

const legacyPublic = publication({}, true);
assert.deepEqual(legacyPublic, {
	visibility: 'public',
	environment: 'legacy',
	discoverable: true,
	classification: 'unclassified'
});
assert.equal(isDiscoverablePublication(legacyPublic), true);

const privatePalace = publication({}, null);
assert.equal(privatePalace.visibility, 'private');
assert.equal(isDiscoverablePublication(privatePalace), false);

const fixturePublic = publication({ publication: { environment: 'fixture' } }, true);
assert.equal(isDiscoverablePublication(fixturePublic), false);
assert.equal(isDiscoverablePublication(fixturePublic, 'fixture'), true);

const explicitlyHidden = publication({ publication: { discoverable: false } }, true);
assert.equal(isDiscoverablePublication(explicitlyHidden), false);

const productionPublic = publication({
	publication: { environment: 'production', classification: 'torah' }
}, true);
assert.equal(isDiscoverablePublication(productionPublic), true);
assert.equal(productionPublic.classification, 'torah');
console.log('B"H HeichelPublicationPolicy.test passed');
