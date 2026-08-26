//B"H
// Boruch Hashem
// Blessed is He

import { operationRegistry } from "../operations/OperationRegistry.js";

/**
 * Copy-only presentation overlay for read operation cards.
 *
 * The Awtsmoos renews one operation even when different chambers describe its light;
 * Awtsmoos.com keeps those contextual words here, never using them to decide whether
 * a capability exists, so presentation may evolve without making backend truth take flight.
 *
 * @module ReadOperationPresentation
 */
const READ_COPY = Object.freeze({
	"overview:meta": Object.freeze(["API Meta", "canonical namespace"]),
	"overview:openapi": Object.freeze(["OpenAPI", "route map"]),
	"overview:v2Gone": Object.freeze(["V2 Removed Probe", "expected invalid route"]),
	"overview:routeHealth": Object.freeze(["Route Health", "four probes"]),
	"live:liveReplay": Object.freeze(["HTTP Live Replay", "event replay"]),
	"search:search": Object.freeze(["Global Search", "aliases and query"]),
	"search:discover": Object.freeze(["Heichel Discovery", "find palaces"]),
	"feed:feedHome": Object.freeze(["Personal / Home Feed", "platform home"]),
	"feed:feed": Object.freeze(["Profile Feed", "posts and comments"]),
	"feed:trending": Object.freeze(["Trending", "ranked activity"]),
	"feed:feedTrending": Object.freeze(["Trending Feed", "platform-wide momentum"]),
	"feed:events": Object.freeze(["Events", "event river"]),
	"discover:discover": Object.freeze(["Heichel Discovery", "search Heichelos"]),
	"discover:recommendations": Object.freeze(["Recommendations", "nearby paths"]),
	"profile:profile": Object.freeze(["Profile Aggregate", "identity hub"]),
	"profile:activity": Object.freeze(["Activity", "timeline"]),
	"profile:history": Object.freeze(["History", "continue reading"]),
	"profile:analytics": Object.freeze(["Analytics", "owner metrics"]),
	"graph:graph": Object.freeze(["Profile Graph", "nodes and edges"]),
	"social:follows": Object.freeze(["Following", "entities followed"]),
	"social:followers": Object.freeze(["Followers", "alias followers"]),
	"notifications:notifications": Object.freeze(["Notifications", "inbox"]),
	"notifications:unreadCount": Object.freeze(["Unread Count", "count"]),
	"admin:submissionSettings": Object.freeze(["Submission Settings", "governance"]),
	"admin:editors": Object.freeze(["Editors", "permissions"]),
	"admin:migrationDryRun": Object.freeze(["Migration Dry Run", "read-only probe"]),
	"developer:openapi": Object.freeze(["OpenAPI", "schema"]),
	"developer:keysVerify": Object.freeze(["Key Verify", "optional API key"]),
	"developer:cacheMiss": Object.freeze(["Cache Miss", "safe cache probe"]),
	"developer:routeHealth": Object.freeze(["Route Health", "live endpoints"])
});

/**
 * Builds the historical `[title, key, hint]` card tuple from contextual copy.
 * @param {string} shemGroup Active panel group.
 * @param {string} shemKey Semantic operation key.
 * @returns {[string, string, string]} Read-card presentation tuple.
 */
export function readCardPresentation(shemGroup, shemKey) {
	const sefirahOperation = operationRegistry.get(shemKey);
	const [malchusTitle, hodHint] = READ_COPY[`${shemGroup}:${shemKey}`] || [
		sefirahOperation?.label || shemKey,
		"social API read"
	];

	return [malchusTitle, shemKey, hodHint];
}
