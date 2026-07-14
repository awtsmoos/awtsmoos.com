//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module FixtureCore
 * @description
 * Same-origin responses and local persistence support the real browser journey.
 * The Awtsmoos creates the fixture world anew while Awtsmoos.com keeps every route
 * deterministic, inspectable, and separate from live user data.
 */

export function createFixtureCore(initialFactory) {
	const key = 'BH.socialHub.browserFixture.v1';
	if (location.search.includes('fixtureReset=1')) localStorage.removeItem(key);
	const core = {
		key,
		state: JSON.parse(localStorage.getItem(key) || 'null') || initialFactory()
	};
	core.save = () => localStorage.setItem(key, JSON.stringify(core.state));
	core.json = (success, status = 200) => Promise.resolve(new Response(
		JSON.stringify(status < 400 ? { success } : { error: success }),
		{ status, headers: { 'content-type': 'application/json' } }
	));
	core.eventId = () => `fixture-event-${core.state.activity.length + 1}`;
	core.commentId = () => `fixture-comment-${core.state.comments.length + 1}`;
	core.assetId = () => `fixture-asset-${core.state.assets.length + 1}`;
	core.profile = aliasId => ({
		alias: core.state.aliases.find(alias => alias.aliasId === aliasId),
		profile: {
			displayName: 'Teacher of Light',
			description: 'A browser-tested social profile.'
		},
		activeTemplate: 'default',
		stats: {
			posts: core.state.posts.length,
			comments: core.state.comments.length
		},
		posts: core.state.posts,
		heichelos: [{ heichelId: 'study', name: 'Study Hall', role: 'owner' }],
		tree: [],
		pinned: [],
		ownerView: true,
		privateHistory: [],
		comments: core.state.comments,
		references: core.state.references,
		activity: core.state.activity
	});
	return core;
}
