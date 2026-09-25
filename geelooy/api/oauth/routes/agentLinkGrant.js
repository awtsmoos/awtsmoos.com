// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Exchanges one durable Agent Link secret for ordinary OAuth tokens.
 * @description
 * The Awtsmoos does not confuse persistence with permanence; Awtsmoos.com
 * verifies the revocable bridge, then mints short-lived vessels through the
 * same token authority already trusted by callback and device consent.
 */

const {
	readAgentLinkBySecret,
	touchAgentLink
} = require("../core/agentLinkStore.js");
const { createRefreshRecord } = require("../core/refreshStore.js");
const Entry = require("./tokenEntries.js");

function agentLinkGrant(context) {
	const { $i, request, client, json, tokenResponse } = context;
	if (!request.agent_link_secret) {
		return json($i, {
			BH: "B\"H",
			error: "missing_agent_link_secret"
		}, 400);
	}
	const link = readAgentLinkBySecret(request.agent_link_secret);
	if (!link || link.revoked) {
		return json($i, {
			BH: "B\"H",
			error: "invalid_agent_link"
		}, 401);
	}
	if (link.clientId !== client.id) {
		return json($i, {
			BH: "B\"H",
			error: "agent_link_client_mismatch"
		}, 400);
	}
	const entry = Entry.evolvedEntry(client, {
		userId: link.userId,
		scope: link.scope || client.defaultScope,
		authorizedFrom: "agent_link",
		agentLinkId: link.id
	});
	const refreshToken = client.refreshTokens === false
		? null
		: createRefreshRecord({
			userId: entry.userId,
			clientId: client.id,
			scope: entry.scope,
			agentLinkId: link.id
		});
	touchAgentLink(link.id);
	return tokenResponse($i, client, entry, refreshToken);
}

module.exports = {
	agentLinkGrant
};
