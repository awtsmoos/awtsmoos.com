// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Manages durable Agent Links only from an already-consented OAuth bearer.
 * @description
 * The Awtsmoos lets one approved vessel create continuity without widening it;
 * Awtsmoos.com binds every link to the same client and a subset of the same scope,
 * avoiding cookie-CSRF and preventing persistence from becoming privilege growth.
 */

const { getClient } = require("../core/clients.js");
const { readBearer } = require("../core/tokenReader.js");
const { splitScopes, validateScope } = require("../core/scopes.js");
const Store = require("../core/agentLinkStore.js");
const { getBody } = require("../tools/requestData.js");
const { json } = require("../tools/respond.js");

function authenticatedBearer($i) {
	const bearer = readBearer($i);
	return bearer.ok ? bearer.entry : null;
}

function resolvedScope(client, bearerEntry, requested) {
	const desired = requested || bearerEntry.scope || client.defaultScope || "";
	const clientScope = validateScope(desired, client.scopes || []);
	if (!clientScope.ok) {
		return clientScope;
	}
	return validateScope(clientScope.scope, splitScopes(bearerEntry.scope || ""));
}

async function agentLinks($i) {
	const bearerEntry = authenticatedBearer($i);
	if (!bearerEntry) {
		return json($i, { BH: "B\"H", error: "bearer_authentication_required" }, 401);
	}
	const userId = String(bearerEntry.userId);
	if (($i.request?.method || "GET").toUpperCase() === "GET") {
		return json($i, {
			BH: "B\"H",
			ok: true,
			links: Store.listAgentLinksForUser(userId)
		});
	}
	const body = await getBody($i);
	const action = String(body.action || "create").toLowerCase();
	if (action === "revoke") {
		const revoked = Store.revokeAgentLink(userId, String(body.id || ""));
		return revoked
			? json($i, { BH: "B\"H", ok: true, revoked: true })
			: json($i, { BH: "B\"H", error: "agent_link_not_found" }, 404);
	}
	if (action !== "create") {
		return json($i, { BH: "B\"H", error: "unsupported_agent_link_action" }, 400);
	}
	const clientId = String(body.client_id || bearerEntry.clientId || "");
	if (!clientId || clientId !== String(bearerEntry.clientId || "")) {
		return json($i, { BH: "B\"H", error: "agent_link_client_mismatch" }, 400);
	}
	const client = getClient(clientId);
	if (!client) {
		return json($i, { BH: "B\"H", error: "unknown_client" }, 400);
	}
	const scope = resolvedScope(client, bearerEntry, body.scope);
	if (!scope.ok) {
		return json($i, {
			BH: "B\"H",
			error: "invalid_scope",
			invalid: scope.invalid
		}, 400);
	}
	const created = Store.createAgentLink({
		userId,
		clientId,
		name: body.name,
		scope: scope.scope
	});
	return json($i, {
		BH: "B\"H",
		ok: true,
		link: created.link,
		agent_link_secret: created.secret,
		secret_notice: "Store this secret outside chat. It is shown only once."
	}, 201);
}

module.exports = {
	agentLinks,
	authenticatedBearer,
	resolvedScope
};
