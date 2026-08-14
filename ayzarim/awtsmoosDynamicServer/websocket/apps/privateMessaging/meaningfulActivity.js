// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Writes only allowlisted social milestones into the existing private-by-default activity ledger.
 * @description The Awtsmoos renews every heartbeat without needing a database, so Awtsmoos.com remembers only deeds with human meaning;
 * friendship, accepted conversation, and group belonging become history while typing, reads, reconnects, and raw requests vanish unseen.
 */

const MILESTONES = Object.freeze({
	"chat.accepted": { action: "chat-accepted", title: "Private chat accepted" },
	"friend.accepted": { action: "friendship-accepted", title: "Friendship accepted" },
	"group.created": { action: "group-created", title: "Private group created" },
	"group.joined": { action: "group-joined", title: "Joined a private group" },
	"group.left": { action: "group-left", title: "Left a private group" },
	"group.role": { action: "group-role-changed", title: "Private group role changed" },
	"contact.blocked": { action: "contact-blocked", title: "Private contact blocked" },
	"public.torah.published": { action: "torah-source-published", title: "Published Torah sources" }
});

/** Records one semantic milestone and silently refuses unrecognized transport-like names. */
async function recordMeaningfulActivity(context, actorAlias, type, details = {}) {
	const definition = MILESTONES[type];
	if (!definition || !actorAlias) {
		return false;
	}
	if (context.privateMessagingEffects?.recordActivity) {
		return context.privateMessagingEffects.recordActivity(
			actorAlias,
			type,
			details
		);
	}
	try {
		const activity = require("../../../../../geelooy/api/social/helper/unifiedActivity/ActivityService.js");
		await activity.record({
			$i: context.server,
			aliasId: actorAlias,
			input: {
				category: type.startsWith("public.") ? "content" : "governance",
				action: definition.action,
				title: definition.title,
				path: details.path || "/apps/universal-chat/",
				entity: {
					type: details.entityType || "private-conversation",
					id: details.entityId || ""
				},
				metadata: sanitizeDetails(details),
				visibility: {
					mode: "private"
				}
			}
		});
		return true;
	} catch (error) {
		console.error(
			"Meaningful activity write failed:",
			error?.message || error
		);
		return false;
	}
}

/** Keeps only small semantic strings, never message bodies or account identifiers. */
function sanitizeDetails(details) {
	const safe = {};
	for (const [key, value] of Object.entries(details || {})) {
		if (["path", "entityType", "entityId"].includes(key)) {
			continue;
		}
		safe[key] = String(value ?? "").slice(0, 180);
	}
	return safe;
}

module.exports = {
	MILESTONES,
	recordMeaningfulActivity
};
