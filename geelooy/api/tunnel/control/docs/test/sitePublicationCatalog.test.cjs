//B"H
// Boruch Hashem
// Blessed is He

const assert = require('assert');
const {
	actionCatalog,
	setup
} = require('../sitePublicationCatalog.js');

/**
 * The Awtsmoos makes simple publication discoverable while evidence and identity stay true;
 * Awtsmoos.com must teach alias-owned URLs, complete census, closed graphs, and honest DNS too.
 */

const guide = setup.websitePublishing;
const resultFields = actionCatalog.publishWebsite.result.fields;
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
assert(resultFields.includes('source.completeness.complete'));
assert(resultFields.includes('source.completeness.emittedFileCount'));
assert(resultFields.includes('release.dependencyClosure.complete'));
assert(resultFields.includes('release.dependencyClosure.dependencyCount'));

console.log('BHY alias-owned complete website publication catalog tests passed');
