// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DiscoveryOperations
 * @description
 * The Awtsmoos keeps metadata, heichel discovery, bulk history work, and event-stream shape in one finite operational
 * vessel so Awtsmoos.com can evolve search and feed without compressing unrelated contracts together.
 */
const { clearHistory, recordHistory } = require('./index.js');
const { allHeichelDiscoveryIds } = require('./heichelDiscoveryIds.js');
const { paths, read } = require('./paths.js');
const { profileFeed } = require('./discoveryFeed.js');
const { cleanText } = require('./sanitize.js');

const FEATURES = [
	'structured-errors', 'cursor-pagination', 'global-search', 'feed-filtering', 'trending',
	'recommendations', 'follow-subscriptions', 'notifications-bridge', 'openapi', 'bulk',
	'graph-expansion', 'etag-meta', 'rate-limit-meta', 'event-stream-shape', 'analytics',
	'heichel-discovery', 'cross-alias-activity'
];
const ROUTES = [
	'/meta', '/openapi.json', '/profiles/batch', '/profiles/:alias', '/profiles/:alias/activity',
	'/profiles/:alias/analytics', '/profiles/:alias/graph', '/profiles/:alias/history', '/search',
	'/feed', '/trending', '/recommendations/:alias', '/follows/:alias', '/followers/:type/:id',
	'/bulk', '/events', '/heichelos/discover'
];

function apiMeta() {
	return {
		version: 'social-unified',
		canonicalNamespace: '/api/social',
		legacyNamespaces: ['/api/social/profile/*'],
		features: FEATURES,
		canonicalRoutes: ROUTES
	};
}

function heichelSearchRank(item, query) {
	if (!query) return 10;
	const hay = [item.id, item.name, item.description, item.author].join(' ').toLowerCase();
	if (!hay.includes(query)) return 0;
	if (item.id.toLowerCase() === query || item.name.toLowerCase() === query) return 40;
	if (item.id.toLowerCase().includes(query)) return 30;
	if (item.name.toLowerCase().includes(query)) return 25;
	return 15;
}

async function heichelDiscover({ $i, query = {} }) {
	const q = cleanText(query.q || '', 120).toLowerCase();
	const ids = await allHeichelDiscoveryIds($i);
	const scanIds = q ? ids : ids.slice(0, 500);
	const items = [];
	for (const id of scanIds) {
		const info = await read($i, paths.heichelInfo(id), {});
		const item = {
			id,
			name: cleanText(info.name || id, 120),
			description: cleanText(info.description || '', 240),
			author: cleanText(info.author || '', 120)
		};
		const rank = heichelSearchRank(item, q);
		if (rank) items.push({ ...item, rank });
	}
	return items
		.sort((left, right) => right.rank - left.rank || left.id.localeCompare(right.id))
		.map(({ rank, ...item }) => item);
}

async function bulk({ $i, input = {} }) {
	const ops = Array.isArray(input.ops) ? input.ops : JSON.parse(input.ops || '[]');
	const results = [];
	for (const op of ops.slice(0, 50)) {
		if (op.action === 'recordHistory') {
			results.push(await recordHistory({ $i, aliasId: op.aliasId, input: op.data || {} }));
		} else if (op.action === 'clearHistory') {
			results.push(await clearHistory({ $i, aliasId: op.aliasId }));
		} else {
			results.push({ error: { code: 'UNKNOWN_BULK_ACTION', action: op.action } });
		}
	}
	return results;
}

async function events({ $i, aliases = [], query = {} }) {
	const items = await profileFeed({ $i, aliases, query });
	return {
		mode: 'json-event-stream-shape',
		retry: 5000,
		events: items.slice(0, Number(query.limit || 40)).map(item => ({
			event: item.kind || item.type || 'activity', id: item.id, data: item
		}))
	};
}

module.exports = { apiMeta, bulk, events, heichelDiscover, heichelSearchRank };
