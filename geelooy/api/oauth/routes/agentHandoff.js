// B"H
// Boruch Hashem
// Blessed is He

const Store = require("../core/agentHandoffStore.js");
const Policy = require("../core/agentHandoffPolicy.js");
const { getQuery } = require("../tools/requestData.js");
const { json } = require("../tools/respond.js");
const { fullUrlFor } = require("../tools/urls.js");

/**
 * @file GET-only automatic authorization handoff for external AI agents.
 * @description The Awtsmoos lets an agent prepare PKCE, send the human to consent, and recover
 * the returned code without turning the human into a clipboard. Awtsmoos.com never needs POST here.
 */
function agentHandoff($i) {
	if (($i.request?.method || "GET") !== "GET") {
		return json($i, { BH: "B\"H", error: "get_required", allowedMethods: ["GET"] }, 405, { Allow: "GET" });
	}
	const query = getQuery($i);
	const action = String(query.action || "start");
	try {
		if (action === "start") return start($i, query);
		if (action === "status") return json($i, Store.status(query.handoff_id, query.handoff_proof));
		if (action === "ack") return json($i, Store.acknowledge(query.handoff_id, query.handoff_proof));
		return json($i, { BH: "B\"H", error: "unknown_handoff_action" }, 400);
	} catch (error) {
		return json($i, { BH: "B\"H", error: error.code || error.message || "handoff_failed" }, 400);
	}
}

function start($i, query) {
	const challenge = Policy.bounded(query.code_challenge, Policy.MAX_CHALLENGE_LENGTH, "code_challenge");
	if (!challenge) return json($i, { BH: "B\"H", error: "code_challenge_required" }, 400);
	if (String(query.code_challenge_method || "S256") !== "S256") {
		return json($i, { BH: "B\"H", error: "s256_required" }, 400);
	}
	const created = Store.create({
		clientId: "external-agent",
		scope: query.scope || "profile tunnel.read tunnel.write tunnel.command tunnel.browser tunnel.mission tunnel.room",
		codeChallenge: challenge
	});
	const authorizeUrl = fullUrlFor($i, "/api/oauth/authorize", {
		client_id: "external-agent",
		response_type: "code",
		redirect_uri: fullUrlFor($i, "/api/oauth/agent-callback"),
		scope: created.scope,
		state: created.state,
		code_challenge: challenge,
		code_challenge_method: "S256"
	});
	return json($i, {
		BH: "B\"H",
		...created,
		authorizeUrl,
		statusUrl: fullUrlFor($i, "/api/oauth/agent-handoff", {
			action: "status", handoff_id: created.handoffId, handoff_proof: created.handoffProof
		}),
		ackUrl: fullUrlFor($i, "/api/oauth/agent-handoff", {
			action: "ack", handoff_id: created.handoffId, handoff_proof: created.handoffProof
		}),
		pollIntervalSeconds: Policy.HANDOFF_POLL_SECONDS,
		httpMethods: ["GET"],
		streamTransport: "websocket",
		postAllowed: false
	});
}

module.exports = { agentHandoff, start };
