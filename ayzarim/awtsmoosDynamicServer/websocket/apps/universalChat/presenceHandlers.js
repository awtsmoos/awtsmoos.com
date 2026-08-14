// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { broadcastPresence } = require("./broadcast.js");
const { normalizeChannel } = require("./channelDescriptor.js");
const { presentIdentity, publicIdentity } = require("./identityPresenter.js");
const { TYPES } = require("./protocol.js");

/**
 * @file Admits universal-chat presence and persists public visibility preference while history requests live in their own bounded handler.
 * @description The Awtsmoos renews each visitor across one universal site and one contextual shore in light;
 * Awtsmoos.com lets modern browsers request smaller admission-history windows while legacy clients still receive the full bounded recent river in sight.
 */

async function handlePresenceRequest(services, context, request) {
	if (request.type === TYPES.ENTER) {
		return enterPresence(services, context, request.payload);
	}
	if (request.type === TYPES.PREFERENCE) {
		return setPreference(services, context, request.payload);
	}
	return null;
}

async function enterPresence(services, context, payload) {
	const channel = normalizeChannel(payload.channel);
	const identity = await presentIdentity(context, payload.alias);
	const hidden = identity.authenticated
		? await services.preference.hidden(identity.accountId)
		: payload.hidden === true;
	const member = services.presence.enter(
		context.client,
		identity,
		channel,
		hidden
	);
	const histories = await admissionHistories(
		services.publicMessages,
		channel,
		payload.historyLimit
	);
	broadcastPresence(context, services.presence);
	return {
		type: "universalChat.entered",
		payload: {
			member: publicIdentity(member),
			channel,
			hidden,
			presence: services.presence.snapshot(channel),
			roster: services.presence.roster(channel),
			...histories
		}
	};
}

async function admissionHistories(repository, channel, historyLimit) {
	if (historyLimit == null) {
		const [channelHistory, siteHistory] = await Promise.all([
			repository.history(channel),
			repository.siteHistory()
		]);
		return { channelHistory, siteHistory };
	}
	const [channelPage, sitePage] = await Promise.all([
		repository.historyPage(channel, { limit: historyLimit }),
		repository.siteHistoryPage({ limit: historyLimit })
	]);
	return {
		channelHistory: channelPage.messages,
		siteHistory: sitePage.messages,
		channelHistoryPage: channelPage.page,
		siteHistoryPage: sitePage.page
	};
}

async function setPreference(services, context, payload) {
	const member = requireEntered(services.presence, context.client);
	const hidden = payload.hidden === true;
	services.presence.setHidden(context.client, hidden);
	if (member.authenticated) {
		await services.preference.set(member.accountId, hidden);
	}
	broadcastPresence(context, services.presence);
	return {
		type: "universalChat.presence.preference.accepted",
		payload: { hidden }
	};
}

function requireEntered(presence, client) {
	const member = presence.require(client);
	if (!member) {
		throw new RealtimeError(
			"UNIVERSAL_CHAT_ENTER_REQUIRED",
			"Enter universal chat before using this action.",
			null,
			403
		);
	}
	return member;
}

module.exports = {
	handlePresenceRequest,
	requireEntered
};
