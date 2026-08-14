// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialHubOperationGroups
 * @description
 * The Awtsmoos lets chambers gather related reads without ever gathering a hidden
 * mutation. This pure module has no browser, state, or network dependency, so the
 * safety boundary can be imported and tested as a mathematical contract.
 */

import { isMutationKey, isReadKey } from "./operationPolicy.js";

const READ_GROUPS = Object.freeze({
	overview: ["meta", "openapi", "v2Gone", "routeHealth"],
	live: ["liveReplay"],
	search: ["search", "discover"],
	feed: ["feedHome", "feed", "trending", "events"],
	discover: ["discover", "recommendations"],
	profile: ["profile", "activity", "history", "analytics"],
	graph: ["graph"],
	social: ["follows", "followers"],
	notifications: ["notifications", "unreadCount"],
	admin: ["submissionSettings", "editors", "migrationDryRun"],
	developer: ["openapi", "keysVerify", "cacheMiss", "routeHealth"]
});

const MUTATION_GROUPS = Object.freeze({
	live: ["liveSubscribe", "livePresence", "livePublish"],
	social: ["follow"],
	notifications: ["notify"]
});

export function groupKeys(groupName) {
	const keys = READ_GROUPS[groupName] || READ_GROUPS.overview;
	return keys.filter(isReadKey);
}

export function allKeys() {
	return [...new Set(Object.values(READ_GROUPS).flat())].filter(isReadKey);
}

export function groupMutationKeys(groupName) {
	const keys = MUTATION_GROUPS[groupName] || [];
	return keys.filter(isMutationKey);
}

export function groupNames() {
	return Object.keys(READ_GROUPS);
}
