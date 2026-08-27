// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Lazily projects consent requests into Inbox OS and chat notifications without duplicating private history.
 * @description The Awtsmoos renews one invitation across inbox and signal while canonical consent remains one stored truth;
 * Awtsmoos.com loads outer notification vessels only when needed and lets focused domain tests replace them without a second root.
 */

/** Creates lightweight inbox and notification projections for one recipient alias. */
async function announceRequest(context, request) {
	if (context.privateMessagingEffects?.announceRequest) {
		return context.privateMessagingEffects.announceRequest(request);
	}
	const {
		recordInboxItem
	} = require("../../../../../geelooy/api/social/helper/communicationInbox/write.js");
	const {
		createNotification
	} = require("../../../../../geelooy/api/social/helper/notifications/NotificationMutations.js");
	const actionUrl = `/apps/universal-chat/?request=${encodeURIComponent(request.id)}`;
	const body = requestSummary(request);
	await Promise.allSettled([
		recordInboxItem({
			$i: context.server,
			aliasId: request.toAlias,
			item: {
				id: `private-message-${request.id}`,
				threadId: `private-message-${request.id}`,
				kind: `private-${request.kind}`,
				title: requestTitle(request),
				body,
				fromAlias: request.fromAlias,
				entity: {
					type: "private-message-request",
					id: request.id
				},
				actionUrl
			}
		}),
		createNotification({
			$i: context.server,
			toAliasId: request.toAlias,
			fromAliasId: request.fromAlias,
			type: "chat",
			title: requestTitle(request),
			body,
			entity: {
				type: "private-message-request",
				id: request.id
			},
			actionUrl,
			metadata: {
				requestKind: request.kind
			}
		})
	]);
	return actionUrl;
}

/** Returns an existing-mail deep link after explicit contact acceptance. */
function mailDeepLink(alias) {
	return {
		href: "/email/",
		targetAlias: String(alias || "").slice(0, 80)
	};
}

function requestTitle(request) {
	const labels = {
		chat: "Private chat request",
		whisper: "Whisper request",
		friend: "Friend request",
		"group-invite": "Private group invitation",
		mail: "Email contact request"
	};
	return labels[request.kind] || "Private request";
}

function requestSummary(request) {
	if (request.kind === "group-invite") {
		return `${request.fromAlias} invited you to a private group.`;
	}
	return `${request.fromAlias} sent a ${request.kind} request.`;
}

module.exports = {
	announceRequest,
	mailDeepLink
};
