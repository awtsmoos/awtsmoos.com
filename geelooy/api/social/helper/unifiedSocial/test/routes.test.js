//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file routes.test.js
 * @description
 * Identity, destinations, publishing, review, and member-governance routes must all
 * remain discoverable. The Awtsmoos has no missing doorway; Awtsmoos.com proves
 * each gate, truthful logged-out identity, canonical law, and ownership metadata.
 */

const assert = require('assert');
const { testInput } = require('./InMemoryDb.js');
const { bootstrap } = require('../identity/AliasBootstrapService.js');
const identityRoutes = require('../../../_awtsmoos.identityBootstrap.js');
const destinationRoutes = require('../../../_awtsmoos.destinations.js');
const publishRoutes = require('../../../_awtsmoos.publishFlow.js');
const reviewRoutes = require('../../../_awtsmoos.reviewCenter.js');
const governanceRoutes = require('../../../_awtsmoos.memberGovernance.js');

function keys(factory) {
	const $i = testInput();
	return Object.keys(factory({ $i })).sort();
}

async function run() {
	const identity = keys(identityRoutes);
	assert(identity.includes('/unified-social/identity'));
	assert(identity.includes('/unified-social/identity/default'));
	const destinations = keys(destinationRoutes);
	assert(destinations.includes('/unified-social/destinations'));
	assert(destinations.includes('/unified-social/heichelos'));
	assert(destinations.some(route => route.includes('/series/:series/policy')));
	const publishing = keys(publishRoutes);
	assert(publishing.includes('/unified-social/publish/preview'));
	assert(publishing.includes('/unified-social/publish'));
	const review = keys(reviewRoutes);
	assert(review.some(route => route.endsWith('/review/:submission')));
	const governance = keys(governanceRoutes);
	assert(governance.some(route => route.endsWith('/members/:member')));
	assert(governance.some(route => route.endsWith('/invitations')));
	assert(governance.some(route => route.includes('/invitations/:invitation/respond')));
	const loggedOut = await bootstrap({ $i: testInput(), userid: '' });
	assert.equal(loggedOut.success.loggedIn, false);
	assert.equal(loggedOut.success.requiresLogin, true);
	assert.deepEqual(loggedOut.success.aliases, []);
	assert.equal(identityRoutes.metadata().success.storesSecrets, false);
	assert.equal(publishRoutes.metadata().success.canonicalOrigins, 1);
	assert.equal(publishRoutes.metadata().success.verifiesAliasOwnership, true);
	assert.equal(reviewRoutes.metadata().success.verifiesAliasOwnership, true);
	assert.equal(governanceRoutes.metadata().success.dualWritesLegacyRoles, true);
	console.log('unifiedSocial routes.test passed');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
