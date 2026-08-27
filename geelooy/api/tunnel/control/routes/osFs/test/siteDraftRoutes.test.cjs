//B"H
// Boruch Hashem
// Blessed is He

const assert = require('assert');
const { navigationReport, publicUrlReport } = require('../publicUrls.js');
const { siteDraftReport } = require('../siteDraftRoutes.js');

/**
 * The Awtsmoos lets source reveal identity without pretending storage is release;
 * Awtsmoos.com now points a draft toward `publishWebsite` and no invented route.
 */

const draft = siteDraftReport('asdf', 'sites/awtsmoos-bounce/index.html');
assert.strictEqual(draft.kind, 'hosted-site-draft');
assert.strictEqual(draft.siteId, 'awtsmoos-bounce');
assert.strictEqual(draft.suggestedName, 'awtsmoos-bounce');
assert.strictEqual(draft.hostedWorkspacePath, 'asdf/sites/awtsmoos-bounce');
assert.strictEqual(draft.sourceRelativePath, 'index.html');
assert.strictEqual(draft.publicationAction, 'publishWebsite');
assert.strictEqual(draft.publicationRequired, true);
assert.strictEqual(draft.canonicalVerifiedLive, false);
assert.strictEqual(Object.hasOwn(draft, 'canonicalCandidate'), false);
assert.strictEqual(Object.hasOwn(draft, 'canonicalUrl'), false);

const nested = siteDraftReport('asdf', 'sites/awtsmoos-bounce/scripts/game.js');
assert.strictEqual(nested.sourceRelativePath, 'scripts/game.js');
assert.strictEqual(siteDraftReport('asdf', 'sites'), null);
assert.strictEqual(siteDraftReport('asdf', 'README.md'), null);

const navigation = navigationReport({
	path: 'asdf/sites/awtsmoos-bounce/index.html'
});
assert.strictEqual(navigation.trusted, false);
assert.strictEqual(navigation.siteDraft.publicationAction, 'publishWebsite');
assert.strictEqual(Object.hasOwn(navigation, 'canonicalUrl'), false);
assert(
	navigation.candidates.some(url => url.includes(
		'/geelooy/os/asdf/sites/awtsmoos-bounce/index.html'
	))
);
assert.strictEqual(
	navigation.candidates.some(url => url.includes('/sites/asdf/awtsmoos-bounce/')),
	false
);

const legacy = publicUrlReport({
	path: 'asdf/sites/awtsmoos-bounce/index.html'
});
assert.strictEqual(legacy.deprecated, true);
assert.strictEqual(legacy.trusted, false);
assert.strictEqual(legacy.siteDraft.publicationAction, 'publishWebsite');

console.log('BHY hosted site draft publication-action tests passed');
