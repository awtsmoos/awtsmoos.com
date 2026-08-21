//B"H
// Boruch Hashem
// Blessed is He

const assert = require('assert');
const {
	actionCatalog,
	setup
} = require('../sitePublicationCatalog.js');

/**
 * The Awtsmoos makes the simplest publication deed discoverable before all machinery;
 * Awtsmoos.com must teach folder-in, verified-URL-out in its machine-readable liturgy.
 */

assert(actionCatalog.publishWebsite);
assert.strictEqual(actionCatalog.publishWebsite.scope, 'tunnel.write');
assert.strictEqual(actionCatalog.publishWebsite.plane, 'public-root-static');
assert.deepStrictEqual(
	actionCatalog.publishWebsite.params,
	['path', 'name?', 'entryFile?', 'verify=true']
);
assert.strictEqual(setup.websitePublishing.preferredAction, 'publishWebsite');
assert.deepStrictEqual(
	setup.websitePublishing.minimalInput,
	{ action: 'publishWebsite', path: 'asdf/projects/my-site' }
);
assert(setup.websitePublishing.defaultRule.includes('web/{alias}/{slug}'));
assert(setup.websitePublishing.compatibilityRule.includes('actionBatch'));

console.log('BHY website publication catalog tests passed');
