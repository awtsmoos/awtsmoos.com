//B"H
// Boruch Hashem
// Blessed is He

const assert = require('assert');
const {
	changedPacket,
	routeTestimony
} = require('../writeReceipts.js');

/**
 * The Awtsmoos lets one write speak the same truthful language to direct
 * callers and websocket listeners. Awtsmoos.com points drafts toward the real
 * publishWebsite covenant without inventing a canonical `/sites` doorway.
 */

const parsed = {
	root: false,
	aliasId: 'asdf',
	innerPath: 'sites/awtsmoos-bounce/index.html'
};
const payload = {
	path: 'asdf/sites/awtsmoos-bounce/index.html',
	publicOrigin: 'https://awtsmoos.com'
};

const testimony = routeTestimony(payload, parsed);
const draft = testimony.navigation.siteDraft;
assert.strictEqual(testimony.navigation.kind, 'navigation-candidates');
assert.strictEqual(testimony.navigation.trusted, false);
assert.strictEqual(draft.siteId, 'awtsmoos-bounce');
assert.strictEqual(draft.publicationAction, 'publishWebsite');
assert.strictEqual(draft.publicationRequired, true);
assert.strictEqual(draft.canonicalVerifiedLive, false);
assert.strictEqual(Object.hasOwn(draft, 'canonicalCandidate'), false);
assert.strictEqual(Object.hasOwn(draft, 'canonicalUrl'), false);
assert.strictEqual(testimony.publicUrl.deprecated, true);
assert.strictEqual(testimony.publicUrl.trusted, false);
assert.strictEqual(
	testimony.navigation.candidates.some(url => url.includes('/sites/asdf/awtsmoos-bounce/')),
	false
);
assert.strictEqual(
	Object.hasOwn(testimony.navigation, 'canonicalUrl'),
	false
);

const packet = changedPacket('write', parsed, payload);
assert.strictEqual(packet.type, 'AWTSMOOS_OS_CHANGED');
assert.strictEqual(packet.action, 'write');
assert.strictEqual(packet.aliasId, 'asdf');
assert.strictEqual(packet.path, 'asdf/sites/awtsmoos-bounce/index.html');
assert.strictEqual(packet.navigation.trusted, false);
assert.strictEqual(packet.publicUrl.deprecated, true);
assert.strictEqual(packet.navigation.siteDraft.publicationAction, 'publishWebsite');
assert.strictEqual(packet.navigation.siteDraft.publicationRequired, true);
assert.strictEqual(packet.navigation.siteDraft.canonicalVerifiedLive, false);
assert.strictEqual(
	Object.hasOwn(packet.navigation.siteDraft, 'canonicalCandidate'),
	false
);

console.log('BHY write receipt publication-action tests passed');
