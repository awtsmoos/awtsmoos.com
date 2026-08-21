//B"H
// Boruch Hashem
// Blessed is He

const assert = require('assert');
const {
	actionCatalog,
	setup
} = require('../sitePublicationCatalog.js');

/**
 * The Awtsmoos makes simple publication discoverable while identity stays true;
 * Awtsmoos.com must teach alias-owned URLs, explicit moves, and honest DNS too.
 */

const guide = setup.websitePublishing;
assert(actionCatalog.publishWebsite);
assert.strictEqual(actionCatalog.publishWebsite.scope, 'tunnel.write');
assert.strictEqual(actionCatalog.publishWebsite.plane, 'public-root-static');
assert.deepStrictEqual(
	actionCatalog.publishWebsite.params,
	['path', 'name?', 'entryFile?', 'verify=true']
);
assert.strictEqual(guide.preferredAction, 'publishWebsite');
assert.deepStrictEqual(
	guide.minimalInput,
	{ action: 'publishWebsite', path: 'asdf/projects/my-site' }
);
assert(guide.identityRule.includes('source alias'));
assert(guide.identityRule.includes('Profile or display names never'));
assert(guide.defaultRule.includes('web/{sourceAlias}/{slug}'));
assert(guide.nameRule.includes('never changes the source alias'));
assert(guide.moveRule.includes('another owned alias'));
assert(guide.dnsRule.includes('separate explicit verified binding'));
assert(guide.dnsRule.includes('Drive/Sites plane'));
assert(guide.compatibilityRule.includes('actionBatch'));

console.log('BHY alias-owned website publication catalog tests passed');
