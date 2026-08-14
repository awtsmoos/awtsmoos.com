// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialHubRenderConfig
 * @description
 * The Awtsmoos names every social chamber while Awtsmoos.com visibly separates
 * safe observation from deliberate change. Read cards and mutation cards never
 * share the same configuration list.
 */

export const panelTabs = [
	["overview", "Overview"],
	["live", "Live"],
	["search", "Search"],
	["feed", "Feed"],
	["discover", "Discover"],
	["profile", "Profiles"],
	["graph", "Graph"],
	["social", "Follows"],
	["notifications", "Signals"],
	["admin", "Governance"],
	["developer", "Developer"]
];

export const panelCopy = {
	overview: ["System overview", "Canonical namespace, route health, and schema truth."],
	live: ["Live social current", "Replay safely; connect or publish only through explicit live actions."],
	search: ["Search the graph", "Find aliases, posts, sources, and Heichelos."],
	feed: ["Read the river", "Home, profile, trending, and event-shaped feeds."],
	discover: ["Discover nearby paths", "Heichel discovery and recommendations."],
	profile: ["Inspect identity", "Aggregate profile, activity, history, and analytics."],
	graph: ["Trace relationships", "Nodes and edges around the active alias."],
	social: ["Relationship chamber", "Explore relationships safely; follow only through Act."],
	notifications: ["Review signals", "Read notifications safely; create one only through Act."],
	admin: ["Governance evidence", "Submission settings, editors, and migration dry-run probes."],
	developer: ["Inspect contracts", "OpenAPI, key verification, cache, and route health."]
};

export const panelCards = {
	overview: [
		["API Meta", "meta", "canonical namespace"],
		["OpenAPI", "openapi", "route map"],
		["V2 Removed Probe", "v2Gone", "expected invalid route"],
		["Route Health", "routeHealth", "four probes"]
	],
	live: [["HTTP Live Replay", "liveReplay", "event replay"]],
	search: [
		["Global Search", "search", "aliases and query"],
		["Heichel Discovery", "discover", "find palaces"]
	],
	feed: [
		["Personal / Home Feed", "feedHome", "platform home"],
		["Profile Feed", "feed", "posts and comments"],
		["Trending", "trending", "ranked activity"],
		["Events", "events", "event river"]
	],
	discover: [
		["Heichel Discovery", "discover", "search Heichelos"],
		["Recommendations", "recommendations", "nearby paths"]
	],
	profile: [
		["Profile Aggregate", "profile", "identity hub"],
		["Activity", "activity", "timeline"],
		["History", "history", "continue reading"],
		["Analytics", "analytics", "owner metrics"]
	],
	graph: [["Profile Graph", "graph", "nodes and edges"]],
	social: [
		["Following", "follows", "entities followed"],
		["Followers", "followers", "alias followers"]
	],
	notifications: [
		["Notifications", "notifications", "inbox"],
		["Unread Count", "unreadCount", "count"]
	],
	admin: [
		["Submission Settings", "submissionSettings", "governance"],
		["Editors", "editors", "permissions"],
		["Migration Dry Run", "migrationDryRun", "read-only probe"]
	],
	developer: [
		["OpenAPI", "openapi", "schema"],
		["Key Verify", "keysVerify", "optional API key"],
		["Cache Miss", "cacheMiss", "safe cache probe"],
		["Route Health", "routeHealth", "live endpoints"]
	]
};

export const mutationCards = {
	live: [
		["HTTP Subscribe", "liveSubscribe"],
		["Set Presence", "livePresence"],
		["HTTP Publish", "livePublish"]
	],
	social: [["Follow target alias", "follow"]],
	notifications: [["Create notification", "notify"]]
};
