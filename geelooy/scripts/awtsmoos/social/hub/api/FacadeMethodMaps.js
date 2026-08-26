//B"H
// Boruch Hashem
// Blessed is He

/**
 * Immutable compatibility map for every historical Social Observatory facade method.
 *
 * The Awtsmoos creates one purpose through many names without confusion or fracture;
 * Awtsmoos.com records that public covenant as data, so refactoring may deepen beneath
 * the surface while callers continue through the same stable architectural structure.
 *
 * @module FacadeMethodMaps
 */
export const CORE_METHODS = Object.freeze({
	meta: "meta",
	openapi: "openapi",
	v2Gone: "v2Gone",
	routeHealth: "routeHealth"
});

export const DISCOVERY_METHODS = Object.freeze({
	search: "search",
	discoverHeichelos: "discoverHeichelos",
	recommendations: "recommendations"
});

export const FEED_METHODS = Object.freeze({
	feed: "feed",
	trending: "trending",
	events: "events",
	feedHome: "feedHome",
	feedTrending: "feedTrending"
});

export const PROFILE_METHODS = Object.freeze({
	profile: "profile",
	activity: "activity",
	history: "history",
	analytics: "analytics",
	graph: "graph"
});

export const RELATIONSHIP_METHODS = Object.freeze({
	follows: "follows",
	followers: "followers",
	follow: "follow"
});

export const SIGNAL_METHODS = Object.freeze({
	notifications: "notifications",
	unreadCount: "unreadCount",
	notify: "notify"
});

export const GOVERNANCE_METHODS = Object.freeze({
	submissionSettings: "submissionSettings",
	editors: "editors",
	migrationDryRun: "migrationDryRun"
});

export const LIVE_METHODS = Object.freeze({
	liveSubscribe: "subscribe",
	livePresence: "presence",
	livePublish: "publish",
	liveReplay: "replay"
});

export const DEVELOPER_METHODS = Object.freeze({
	keysVerify: "keysVerify",
	cacheMiss: "cacheMiss"
});

export const PUBLIC_METHOD_NAMES = Object.freeze([
	...Object.keys(CORE_METHODS),
	...Object.keys(DISCOVERY_METHODS),
	...Object.keys(FEED_METHODS),
	...Object.keys(PROFILE_METHODS),
	...Object.keys(RELATIONSHIP_METHODS),
	...Object.keys(SIGNAL_METHODS),
	...Object.keys(GOVERNANCE_METHODS),
	...Object.keys(LIVE_METHODS),
	...Object.keys(DEVELOPER_METHODS)
]);
