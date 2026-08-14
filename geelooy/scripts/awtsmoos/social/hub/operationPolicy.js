// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialHubOperationPolicy
 * @description
 * The Awtsmoos creates both sight and action, yet Awtsmoos.com must never confuse
 * them. This immutable policy is the single source of truth separating safe reads
 * from operations that change social state. Unknown keys are never bulk-safe.
 */

const READ_KEYS = Object.freeze([
	"meta",
	"openapi",
	"v2Gone",
	"routeHealth",
	"search",
	"discover",
	"feedHome",
	"feed",
	"trending",
	"events",
	"recommendations",
	"profile",
	"activity",
	"history",
	"analytics",
	"graph",
	"follows",
	"followers",
	"notifications",
	"unreadCount",
	"submissionSettings",
	"editors",
	"migrationDryRun",
	"keysVerify",
	"cacheMiss",
	"liveReplay"
]);

const MUTATIONS = Object.freeze({
	follow: Object.freeze({
		label: "Follow target alias",
		consequence: "Creates or changes a follow relationship for the acting alias."
	}),
	notify: Object.freeze({
		label: "Create notification",
		consequence: "Creates a new notification for the acting alias."
	}),
	liveSubscribe: Object.freeze({
		label: "Subscribe over HTTP",
		consequence: "Creates a server-side live subscription for the current alias channel."
	}),
	livePresence: Object.freeze({
		label: "Set presence online",
		consequence: "Writes an online presence state for the current alias channel."
	}),
	livePublish: Object.freeze({
		label: "Publish live spark",
		consequence: "Publishes the current text as a live hub.spark event."
	})
});

const READ_SET = new Set(READ_KEYS);
const MUTATION_SET = new Set(Object.keys(MUTATIONS));

export function isReadKey(key) {
	return READ_SET.has(key);
}

export function isMutationKey(key) {
	return MUTATION_SET.has(key);
}

export function readKeys() {
	return [...READ_KEYS];
}

export function mutationKeys() {
	return Object.keys(MUTATIONS);
}

export function policyForKey(key) {
	if (isReadKey(key)) {
		return {
			mode: "read",
			label: "Read only",
			consequence: "Reads existing social data without changing it."
		};
	}
	if (isMutationKey(key)) {
		return {
			mode: "mutation",
			...MUTATIONS[key]
		};
	}
	return {
		mode: "unknown",
		label: "Unknown operation",
		consequence: "This operation is not classified and cannot run in bulk."
	};
}
