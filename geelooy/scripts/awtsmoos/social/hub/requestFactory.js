// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialHubRequestFactory
 * @description
 * The Awtsmoos gives every operation its exact existing endpoint. Awtsmoos.com
 * keeps selection explicit while request context and payload construction live in
 * their own vessel, leaving this switch readable, auditable, and small.
 */

import { socialApi } from "./api.js";
import {
	followPayload,
	livePayload,
	migrationPayload,
	notificationPayload,
	publishPayload,
	requestContext
} from "./requestContext.js";

export function requestForKey(key) {
	const context = requestContext();
	switch (key) {
		case "meta":
			return socialApi.meta();
		case "openapi":
			return socialApi.openapi();
		case "v2Gone":
			return socialApi.v2Gone();
		case "routeHealth":
			return routeHealth();
		case "search":
			return socialApi.search({ aliases: context.alias, q: context.query });
		case "discover":
			return socialApi.discoverHeichelos({ q: context.query });
		case "feedHome":
			return socialApi.feedHome(context.alias);
		case "feed":
			return socialApi.feed({ aliases: context.alias });
		case "trending":
			return socialApi.trending({ aliases: context.alias });
		case "events":
			return socialApi.events({ aliases: context.alias });
		case "recommendations":
			return socialApi.recommendations(context.alias);
		case "profile":
			return socialApi.profile(context.alias);
		case "activity":
			return socialApi.activity(context.alias);
		case "history":
			return socialApi.history(context.alias);
		case "analytics":
			return socialApi.analytics(context.alias);
		case "graph":
			return socialApi.graph(context.alias);
		case "follows":
			return socialApi.follows(context.alias);
		case "followers":
			return socialApi.followers(context.alias);
		case "follow":
			return socialApi.follow(followPayload(context));
		case "notifications":
			return socialApi.notifications(context.alias);
		case "unreadCount":
			return socialApi.unreadCount(context.alias);
		case "notify":
			return socialApi.notify(notificationPayload(context));
		case "submissionSettings":
			return socialApi.submissionSettings(migrationPayload().heichelId);
		case "editors":
			return socialApi.editors(migrationPayload().heichelId);
		case "migrationDryRun":
			return socialApi.migrationDryRun(migrationPayload());
		case "keysVerify":
			return socialApi.keysVerify("");
		case "cacheMiss":
			return socialApi.cacheMiss();
		case "liveSubscribe":
			return socialApi.liveSubscribe(livePayload(context));
		case "livePresence":
			return socialApi.livePresence(livePayload(context));
		case "livePublish":
			return socialApi.livePublish(publishPayload(context));
		case "liveReplay":
			return socialApi.liveReplay({ channel: context.channel });
		default:
			throw new Error(`Unknown social operation: ${key}`);
	}
}

async function routeHealth() {
	const body = await socialApi.routeHealth();
	return {
		ok: true,
		status: 200,
		body: {
			ok: true,
			data: body
		}
	};
}
