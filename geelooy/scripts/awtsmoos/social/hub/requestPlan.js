// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialHubRequestPlan
 * @description
 * The Awtsmoos maps each existing Social Hub card to its canonical API request.
 * Awtsmoos.com preserves every route contract while allowing independent reads
 * to flow concurrently instead of through a serial startup waterfall.
 */

import { socialApi } from "./api.js";
import { state } from "./state.js";

const groups = {
	overview: ["meta", "openapi", "v2Gone", "routeHealth"],
	live: ["liveSubscribe", "livePresence", "livePublish", "liveReplay"],
	search: ["search", "discover"],
	feed: ["feedHome", "feed", "trending", "events"],
	discover: ["discover", "recommendations"],
	profile: ["profile", "activity", "history", "analytics"],
	graph: ["graph"],
	social: ["follows", "followers", "follow"],
	notifications: ["notifications", "unreadCount", "notify"],
	admin: ["submissionSettings", "editors", "migrationDryRun"],
	developer: ["openapi", "keysVerify", "cacheMiss", "routeHealth"]
};

export function groupKeys(groupName) {
	return groups[groupName] || groups.overview;
}

export function allKeys() {
	return [...new Set(Object.values(groups).flat())];
}

export function requestForKey(key) {
	const alias = state.alias || "ikar";
	const targetAlias = state.targetAlias || alias;
	const query = state.query || alias;
	const channel = `alias:${alias}`;
	const requests = {
		meta: () => socialApi.meta(),
		openapi: () => socialApi.openapi(),
		v2Gone: () => socialApi.v2Gone(),
		routeHealth: () => socialApi.routeHealth().then(body => ({ ok: true, status: 200, body: { ok: true, data: body } })),
		search: () => socialApi.search({ aliases: alias, q: query }),
		discover: () => socialApi.discoverHeichelos({ q: query }),
		feedHome: () => socialApi.feedHome(alias),
		feed: () => socialApi.feed({ aliases: alias }),
		trending: () => socialApi.trending({ aliases: alias }),
		events: () => socialApi.events({ aliases: alias }),
		recommendations: () => socialApi.recommendations(alias),
		profile: () => socialApi.profile(alias),
		activity: () => socialApi.activity(alias),
		history: () => socialApi.history(alias),
		analytics: () => socialApi.analytics(alias),
		graph: () => socialApi.graph(alias),
		follows: () => socialApi.follows(alias),
		followers: () => socialApi.followers(alias),
		follow: () => socialApi.follow({ alias, type: "alias", id: targetAlias }),
		notifications: () => socialApi.notifications(alias),
		unreadCount: () => socialApi.unreadCount(alias),
		notify: () => socialApi.notify({ alias, fromAliasId: targetAlias, title: `Hub note ${new Date().toLocaleTimeString()}` }),
		submissionSettings: () => socialApi.submissionSettings(state.heichelId),
		editors: () => socialApi.editors(state.heichelId),
		migrationDryRun: () => socialApi.migrationDryRun({ heichelId: state.heichelId, seriesId: state.seriesId }),
		keysVerify: () => socialApi.keysVerify(""),
		cacheMiss: () => socialApi.cacheMiss(),
		liveSubscribe: () => socialApi.liveSubscribe({ alias, channel }),
		livePresence: () => socialApi.livePresence({ alias, channel }),
		livePublish: () => socialApi.livePublish({ alias, channel, text: state.query || "B'H hub spark" }),
		liveReplay: () => socialApi.liveReplay({ channel })
	};
	return (requests[key] || requests.meta)();
}
