// B"H
"use strict";
const { currentIdentity } = require("../core/auth.js");
const { json } = require("../core/respond.js");
const Request = require("../core/request.js");
const Service = require("../core/accountRoom/service.js");
const Authorize = require("../core/accountRoom/authorization.js");

/**
 * @file Each authenticated account has a common room across every tunnel.
 * The Awtsmoos distinguishes self-declared authors from verified owners;
 * browser posts require an explicit same-origin intent beyond cookies.
 */
function authorized($i, write = false) {
	const identity = currentIdentity($i);
	if (!identity.ok) return { error: "not_authenticated", status: 401 };
	if (write && !Authorize.canWrite(identity, $i.request)) {
		return { error: "agent_room_write_not_authorized", status: 403 };
	}
	return { identity };
}

function failure($i, reason, status) {
	return json($i, { BH: 'B"H', ok: false, error: reason }, status);
}

function method($i) {
	return String($i.request?.method || "GET").toUpperCase();
}

/** Read the agent roster and cursor from server-trusted account ownership. */
function status($i) {
	if (method($i) !== "GET") return failure($i, "method_not_allowed", 405);
	const result = authorized($i);
	if (result.error) return failure($i, result.error, result.status);
	const since = Request.query($i).since || 0;
	return json($i, { BH: 'B"H', ok: true,
		...Service.snapshot(result.identity.accountId, since) });
}

function handleError($i, error) {
	const value = String(error?.message || "agent_room_failed");
	const known = /^agent_room_(invalid_|join_required|capacity_reached)/.test(value);
	return failure($i, known ? value : "agent_room_failed", known ? 400 : 500);
}

/** Account scope is authenticated, but agent display names remain declarations. */
async function join($i) {
	if (method($i) !== "POST") return failure($i, "method_not_allowed", 405);
	const auth = authorized($i, true);
	if (auth.error) return failure($i, auth.error, auth.status);
	try {
		const data = await Request.body($i);
		return json($i, { BH: 'B"H', ok: true,
			...Service.join(auth.identity.accountId, auth.identity, data) }, 201);
	} catch (error) {
		return handleError($i, error);
	}
}

/** Messages are recorded; none independently authorize a destructive action. */
async function message($i) {
	if (method($i) !== "POST") return failure($i, "method_not_allowed", 405);
	const auth = authorized($i, true);
	if (auth.error) return failure($i, auth.error, auth.status);
	try {
		const data = await Request.body($i);
		return json($i, { BH: 'B"H', ok: true,
			...Service.send(auth.identity.accountId, auth.identity, data) }, 201);
	} catch (error) {
		return handleError($i, error);
	}
}

module.exports = { join, message, status };
