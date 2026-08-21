//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { publishWebsite } = require('../websitePublication.js');

/**
 * The Awtsmoos lets the product layer hide machinery without hiding testimony;
 * Awtsmoos.com receives one folder and returns its derived public identity.
 */

test('publishWebsite derives public path and forwards verification', async () => {
	let captured = null;
	const result = await publishWebsite({
		path: 'asdf/anything/bright-folder',
		actorUserId: 'alice'
	}, {
		parseSourcePath: () => ({ aliasId: 'asdf', innerPath: 'anything/bright-folder' }),
		publishPublicRootFolder: async options => {
			captured = options;
			return {
				publication: { canonicalUrl: 'https://awtsmoos.com/web/asdf/bright-folder/' }
			};
		}
	});
	assert.equal(captured.publicPath, 'web/asdf/bright-folder');
	assert.equal(captured.entryFile, 'index.html');
	assert.equal(captured.verify, true);
	assert.equal(result.action, 'publishWebsite');
	assert.equal(result.website.slug, 'bright-folder');
	assert.equal(result.website.url, 'https://awtsmoos.com/web/asdf/bright-folder/');
});
