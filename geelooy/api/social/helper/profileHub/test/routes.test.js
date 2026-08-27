//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file routes.test.js
 * @description
 * Activity, interaction, and profile routes plus public-profile redaction remain
 * discoverable. The Awtsmoos has no missing doorway while Awtsmoos.com proves
 * private return history never enters another viewer's profile response.
 */

const assert = require('assert');
const activityRoutes = require('../../../_awtsmoos.activityLedger.js');
const interactionRoutes = require('../../../_awtsmoos.interactionFlow.js');
const profileRoutes = require('../../../_awtsmoos.profileHub.js');
const { publicBase } = require('../ProfileOverview.js');
const {
	testInput
} = require('../../unifiedSocial/test/InMemoryDb.js');

function keys(factory) {
	return Object.keys(factory({ $i: testInput() })).sort();
}

const activity = keys(activityRoutes);
assert(activity.includes('/unified-social/activity/:alias'));
assert(activity.includes('/unified-social/activity/:alias/preferences'));
assert(activity.includes('/unified-social/activity/:alias/events/:event'));
assert(activity.includes('/unified-social/activity/:alias/shared'));
assert.equal(activityRoutes.metadata().success.privateByDefault, true);

const interactions = keys(interactionRoutes);
assert(interactions.includes('/unified-social/interactions/comments'));
assert(interactions.includes('/unified-social/interactions/posts/:post/embed-comment'));
assert(interactions.includes('/unified-social/interactions/comments/:comment/promote'));
assert.equal(interactionRoutes.metadata().success.canonicalComments, true);
assert.equal(interactionRoutes.metadata().success.canonicalPosts, true);

const profiles = keys(profileRoutes);
assert(profiles.includes('/unified-social/profile-hub/:alias'));
assert.equal(profileRoutes.metadata().success.activityPrivateByDefault, true);
const profile = {
	alias: { id: 'teacher' },
	profile: { displayName: 'Teacher' },
	activeTemplate: 'default',
	stats: { posts: 1 },
	posts: [{ id: 'p1' }],
	heichelos: [],
	tree: [],
	pinned: [],
	history: [{ path: '/private-return' }]
};
assert.deepEqual(publicBase(profile, false).privateHistory, []);
assert.equal(publicBase(profile, true).privateHistory.length, 1);
console.log('profileHub routes.test passed');
