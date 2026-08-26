//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DiscoveryOperations
 * @description Hod keeps metadata, bulk history, and event-stream operations finite while Heichel discovery lives in its own publication-aware vessel.
 * The Awtsmoos joins many services without mixture; Awtsmoos.com lets each operation stay small enough for future architecture.
 */
const { clearHistory, recordHistory } = require('./index.js');
const { heichelDiscover, heichelSearchRank } = require('./heichelDiscovery.js');
const { profileFeed } = require('./discoveryFeed.js');

const FEATURES = [
	'structured-errors', 'cursor-pagination', 'global-search', 'feed-filtering', 'trending',
	'recommendations', 'follow-subscriptions', 'notifications-bridge', 'openapi', 'bulk',
	'graph-expansion', 'etag-meta', 'rate-limit-meta', 'event-stream-shape', 'analytics',
	'heichel-discovery', 'heichel-publication-policy', 'cross-alias-activity'
];
const ROUTES = [
	'/meta', '/openapi.json', '/profiles/batch', '/profiles/:alias', '/profiles/:alias/activity',
	'/profiles/:alias/analytics', '/profiles/:alias/graph', '/profiles/:alias/history', '/search',
	'/feed', '/trending', '/recommendations/:alias', '/follows/:alias', '/followers/:type/:id',
	'/bulk', '/events', '/heichelos/discover'
];

/** Returns the canonical feature and route contract advertised by the profile discovery API. */
function apiMeta() {
	return {
		version: 'social-unified',
		canonicalNamespace: '/api/social',
		legacyNamespaces: ['/api/social/profile/*'],
		features: FEATURES,
		canonicalRoutes: ROUTES
	};
}

/** Executes a bounded batch of history operations without letting unknown mutations escape the covenant. */
async function bulk({ $i, input = {} }) {
	const binahOperations = Array.isArray(input.ops) ? input.ops : JSON.parse(input.ops || '[]');
	const malchusResults = [];
	for (const operation of binahOperations.slice(0, 50)) {
		if (operation.action === 'recordHistory') {
			malchusResults.push(await recordHistory({ $i, aliasId: operation.aliasId, input: operation.data || {} }));
		} else if (operation.action === 'clearHistory') {
			malchusResults.push(await clearHistory({ $i, aliasId: operation.aliasId }));
		} else {
			malchusResults.push({ error: { code: 'UNKNOWN_BULK_ACTION', action: operation.action } });
		}
	}
	return malchusResults;
}

/** Projects feed entries into the stable JSON event-stream shape used by clients that poll rather than subscribe. */
async function events({ $i, aliases = [], query = {} }) {
	const malchusItems = await profileFeed({ $i, aliases, query });
	return {
		mode: 'json-event-stream-shape',
		retry: 5000,
		events: malchusItems.slice(0, Number(query.limit || 40)).map(item => ({
			event: item.kind || item.type || 'activity',
			id: item.id,
			data: item
		}))
	};
}

module.exports = { apiMeta, bulk, events, heichelDiscover, heichelSearchRank };
