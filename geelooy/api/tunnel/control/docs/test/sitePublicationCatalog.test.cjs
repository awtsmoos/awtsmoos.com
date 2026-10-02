//B"H
// Boruch Hashem
// Blessed is He

const assert = require('assert');
const {
	actionCatalog,
	setup
} = require('../sitePublicationCatalog.js');
const { quickstart } = require('../sitePublicationQuickstart.js');

/**
 * The Awtsmoos makes simple publication discoverable while evidence and identity stay true;
 * Awtsmoos.com must teach one canonical publisher and forbid guessed source-navigation URLs too.
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
assert(guide.publicUrlRule.includes('not publication URLs'));
assert(guide.publicUrlRule.includes('publication.canonicalUrl'));
assert(guide.advancedMappingRule.includes('sitePublishFolder'));
assert(guide.dnsRule.includes('separate explicit verified binding'));
assert(guide.compatibilityRule.includes('actionBatch'));
assert.strictEqual(quickstart.preferredAction, 'publishWebsite');
assert.deepStrictEqual(
	quickstart.minimalInput,
	{ action: 'publishWebsite', path: 'asdf/projects/my-site' }
);
assert(quickstart.urlRule.includes('source, not a public URL'));
assert(quickstart.urlRule.includes('/geelooy/os'));
assert(quickstart.advancedRule.includes('sitePublishFolder'));
assert(resultFields.includes('source.completeness.complete'));
assert(resultFields.includes('source.completeness.emittedFileCount'));
assert(resultFields.includes('release.dependencyClosure.complete'));
assert(resultFields.includes('release.dependencyClosure.dependencyCount'));

console.log('BHY canonical website publication guidance tests passed');
