// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialHubRenderConfig
 * @description
 * The Awtsmoos names every existing Social Hub chamber once. Awtsmoos.com uses
 * this map for visible navigation, contextual headings, and API result cards.
 */

export const panelTabs = [
	["overview", "Overview"],
	["live", "Live Socket"],
	["search", "Search"],
	["feed", "Feed"],
	["discover", "Discover"],
	["profile", "Profiles"],
	["graph", "Graph"],
	["social", "Follows"],
	["notifications", "Notifications"],
	["admin", "Governance"],
	["developer", "Developer"]
];

export const panelCopy = {
	overview: ["System overview", "Canonical namespace, route health, and schema truth."],
	live: ["Live social current", "WebSocket and HTTP presence through one channel."],
	search: ["Search the graph", "Find aliases, posts, sources, and Heichelos."],
	feed: ["Read the river", "Home, profile, trending, and event-shaped feeds."],
	discover: ["Discover nearby paths", "Heichel discovery and recommendations."],
	profile: ["Inspect identity", "Aggregate profile, activity, history, and analytics."],
	graph: ["Trace relationships", "Nodes and edges around the active alias."],
	social: ["Follow connections", "Following, followers, and target alias actions."],
	notifications: ["Review signals", "Notification inbox, unread count, and delivery."],
	admin: ["Govern the Heichel", "Submission settings, editors, and migration probes."],
	developer: ["Inspect contracts", "OpenAPI, key verification, cache, and route health."]
};

export const panelCards = {
	overview: [["API Meta", "meta", "canonical namespace"], ["OpenAPI", "openapi", "route map"], ["V2 Removed Probe", "v2Gone", "expected invalid route"], ["Route Health", "routeHealth", "four probes"]],
	search: [["Global Search", "search", "aliases and query"], ["Heichel Discovery", "discover", "find palaces"]],
	feed: [["Personal / Home Feed", "feedHome", "platform home"], ["Profile Feed", "feed", "posts and comments"], ["Trending", "trending", "ranked activity"], ["Events", "events", "event river"]],
	discover: [["Heichel Discovery", "discover", "search Heichelos"], ["Recommendations", "recommendations", "nearby paths"]],
	profile: [["Profile Aggregate", "profile", "identity hub"], ["Activity", "activity", "timeline"], ["History", "history", "continue reading"], ["Analytics", "analytics", "owner metrics"]],
	graph: [["Profile Graph", "graph", "nodes and edges"]],
	social: [["Following", "follows", "entities followed"], ["Followers", "followers", "alias followers"], ["Follow Action", "follow", "target alias"]],
	notifications: [["Notifications", "notifications", "inbox"], ["Unread Count", "unreadCount", "count"], ["Create Notification", "notify", "synthetic UI note"]],
	admin: [["Submission Settings", "submissionSettings", "governance"], ["Editors", "editors", "permissions"], ["Migration Dry Run", "migrationDryRun", "safe probe"]],
	developer: [["OpenAPI", "openapi", "schema"], ["Key Verify", "keysVerify", "optional API key"], ["Cache Miss", "cacheMiss", "safe cache probe"], ["Route Health", "routeHealth", "live endpoints"]],
	live: [["HTTP Live Subscribe", "liveSubscribe", "channel subscribe"], ["HTTP Live Presence", "livePresence", "presence"], ["HTTP Live Publish", "livePublish", "fallback publish"], ["HTTP Live Replay", "liveReplay", "event replay"]]
};
