// B"H
"use strict";
const { currentIdentity } = require("../core/auth.js");
const { query } = require("../core/request.js");
const { json, setHeader } = require("../core/respond.js");
const Store = require("../core/store.js");
const State = require("../agentLobby/state.js");
const Presence = require("../agentLobby/presence.js");

/**
 * @file An account-wide gathering of authenticated Awtsmoos agents.
 * Two native vessels meet without a shared disk. No claim of a human's
 * instruction is treated as authority merely because it appears in chat.
 */
function authenticate(context, write = false) {
	const identity = currentIdentity(context);
	if (!identity.ok) return { error: "not_authenticated", status: 401 };
	if (!identity.scopes.includes("tunnel.read") && !identity.scopes.includes("tunnel.admin")) {
		return { error: "tunnel_read_scope_required", status: 403 };
	}
	if (write && identity.kind === "session") {
		return { error: "bearer_or_api_key_required_for_get_mutation", status: 403 };
	}
	if (write && !identity.scopes.includes("tunnel.write") &&
		!identity.scopes.includes("tunnel.admin")) {
		return { error: "tunnel_write_scope_required", status: 403 };
	}
	return { identity };
}

function respond(context, data, status = 200) {
	setHeader(context, "Cache-Control", "no-store, private");
	return json(context, { BH: 'B"H', ...data }, status);
}

/** Show an automatically discovered, verified collection of tunnel devices. */
async function agentLobbyList(context) {
	const auth = authenticate(context);
	if (auth.error) return respond(context, { ok: false, error: auth.error }, auth.status);
	const accountId = auth.identity.accountId;
	const store = Store.readStore();
	return respond(context, {
		ok: true, room: "account-agent-lobby",
		devices: Presence.devices(context, store, accountId),
		...State.snapshot(store, accountId)
	});
}

/** Join or heartbeat a declared AI actor without forging a verified author. */
async function agentLobbyJoin(context) {
	const auth = authenticate(context, true);
	if (auth.error) return respond(context, { ok: false, error: auth.error }, auth.status);
	try {
		const values = query(context);
		const participant = Store.mutateStore(store => {
			if (!Presence.ownsTunnel(store, auth.identity.accountId, values.tunnelName)) {
				throw new Error("tunnel_not_owned");
			}
			return State.join(store, auth.identity, values);
		});
		return respond(context, { ok: true, participant });
	} catch (error) {
		return respond(context, { ok: false, error: error.message }, 400);
	}
}

/** Commit a deduplicated message, including explicit conflict testimony. */
async function agentLobbyPost(context) {
	const auth = authenticate(context, true);
	if (auth.error) return respond(context, { ok: false, error: auth.error }, auth.status);
	try {
		const message = Store.mutateStore(store =>
			State.post(store, auth.identity, query(context)));
		return respond(context, { ok: true, message });
	} catch (error) {
		return respond(context, { ok: false, error: error.message }, 400);
	}
}

module.exports = { agentLobbyJoin, agentLobbyList, agentLobbyPost };
