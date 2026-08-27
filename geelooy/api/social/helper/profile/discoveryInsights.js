// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DiscoveryInsights
 * @description
 * The Awtsmoos gathers recommendations, analytics, and graph shape around one public alias while Awtsmoos.com keeps
 * these heavier profile interpretations separate from global search and feed transport.
 */
const { aggregateProfile } = require('./index.js');
const { listFollows } = require('./follows.js');

async function recommendations({ $i, aliasId, query = {} }) {
	const profile = await aggregateProfile({ $i, aliasId });
	if (!profile) return [];
	const followed = new Set((await listFollows({ $i, aliasId })).map(item => `${item.type}:${item.id}`));
	const heichelos = (profile.heichelos || [])
		.filter(item => !followed.has(`heichel:${item.id}`))
		.map(item => ({ type: 'heichel', id: item.id, title: item.name, reason: 'You contributed here.' }));
	const activity = (profile.activity || []).map(item => ({
		type: 'activity', id: item.id, title: item.title, reason: 'Based on recent activity.'
	}));
	return [...heichelos, ...activity].slice(0, Number(query.limit || 20));
}

async function analytics({ $i, aliasId }) {
	const profile = await aggregateProfile({ $i, aliasId });
	if (!profile) return null;
	return {
		aliasId,
		totals: profile.stats,
		activityCount: profile.activity?.length || 0,
		historyCount: profile.history?.length || 0,
		postsWithSections: (profile.posts || []).reduce((sum, post) => {
			return sum + Number(post.sectionsCount || 0);
		}, 0),
		topHeichelos: (profile.heichelos || []).slice(0, 10)
	};
}

async function graph({ $i, aliasId, query = {} }) {
	const profile = await aggregateProfile({ $i, aliasId });
	if (!profile) return null;
	const nodes = [{ id: `alias:${aliasId}`, type: 'alias', label: profile.profile.displayName }];
	const edges = [];
	for (const heichel of profile.heichelos || []) {
		nodes.push({ id: `heichel:${heichel.id}`, type: 'heichel', label: heichel.name });
		edges.push({ from: `alias:${aliasId}`, to: `heichel:${heichel.id}`, kind: heichel.role || 'related' });
	}
	for (const post of (profile.posts || []).slice(0, Number(query.limit || 80))) {
		nodes.push({ id: `post:${post.postId}`, type: 'post', label: post.title });
		edges.push({ from: `alias:${aliasId}`, to: `post:${post.postId}`, kind: 'authored' });
		if (post.heichelId) {
			edges.push({ from: `post:${post.postId}`, to: `heichel:${post.heichelId}`, kind: 'in' });
		}
	}
	return { nodes, edges };
}

module.exports = { analytics, graph, recommendations };
