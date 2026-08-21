//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	slugifyWebsiteName,
	websiteIdentity
} = require('../websitePublicationName.js');

/**
 * The Awtsmoos turns a human name toward one stable address in measured rhyme;
 * Awtsmoos.com namespaces each alias so two creators never collide in time.
 */

test('folder basename becomes the default website identity', () => {
	const identity = websiteIdentity({
		aliasId: 'asdf',
		innerPath: 'projects/my-cool-site'
	});
	assert.deepEqual(identity, {
		displayName: 'my-cool-site',
		slug: 'my-cool-site',
		publicPath: 'web/asdf/my-cool-site'
	});
});

test('friendly names become stable ASCII slugs', () => {
	assert.equal(slugifyWebsiteName('Mitzváh Light!'), 'mitzvah-light');
	assert.equal(
		websiteIdentity({ aliasId: 'alice', innerPath: 'drafts/x' }, 'Holy Orbit').publicPath,
		'web/alice/holy-orbit'
	);
});

test('reserved and empty names fail closed', () => {
	assert.throws(() => slugifyWebsiteName('sites'), error => error.code === 'WEBSITE_NAME_RESERVED');
	assert.throws(
		() => websiteIdentity({ aliasId: 'asdf', innerPath: '' }),
		error => error.code === 'WEBSITE_NAME_REQUIRED'
	);
});
