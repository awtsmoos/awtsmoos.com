// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { eventEnvelope } = require("../../platform/ProtocolEnvelope.js");
const { ShliachBrowserRooms } = require("./rooms.js");
const { APPLICATION_ID, VERSION } = require("./protocol.js");

/**
 * Pairs one OAuth-verified AI agent with one browser extension, by short
 * code, and forwards their JSON messages to each other.
 *
 * The agent creates a code (it must be signed in — verified identity with
 * an accountId). It shows the code to the user, who types it into the
 * extension popup; the extension joins with the code (the code IS the
 * browser's authorization). From then on `shliach.send` from either side
 * is delivered to the peer as a `shliach.message` event. The relay never
 * stores message contents and never interprets them; it only forwards.
 *
 * Message types (all under application "shliach-browser", version 1):
 *   shliach.create  (agent, verified) -> { code, expiresAt }
 *   shliach.join    (browser, code)   -> { code, paired }
 *   shliach.send    (either, data)    -> { delivered } ; peer gets event shliach.message { from, data }
 *   shliach.leave   (either)          -> { left }
 *   shliach.status  (either)          -> { paired, role, code }
 * Events (pushed, no requestId):
 *   shliach.browser-joined { code }   (to the agent, when the browser joins)
 *   shliach.peer-left { role }        (to the surviving peer, when the other side leaves/disconnects)
 *   shliach.message { from, data }    (the forwarded message)
 */
function createShliachBrowserApplication(options = {}) {
	const rooms = options.rooms || new ShliachBrowserRooms(options);
	return {
		id: APPLICATION_ID,
		legacyTypes: [],
		versions: [VERSION],
		disconnect({ client }) {
			// Resolve the peer BEFORE leaving: leave() removes the client,
			// so the peer is unresolvable afterwards.
			const peer = rooms.peerOf(client);
			const role = rooms.roleOf(client);
			const left = rooms.leave(client);
			if (!left || !peer) return;
			try {
				peer.send(eventEnvelope(APPLICATION_ID, VERSION, "shliach.peer-left", { role }));
			} catch (_) {}
		},
		stop() {
			rooms.closeAll();
		},
		async handleVersioned(context, request) {
			if (request.type === "shliach.create") return createRoom(context, rooms);
			if (request.type === "shliach.join") return joinRoom(context, request.payload, rooms);
			if (request.type === "shliach.send") return sendToPeer(context, request.payload, rooms);
			if (request.type === "shliach.leave") return leaveRoom(context, rooms);
			if (request.type === "shliach.status") return statusOf(context, rooms);
			throw new RealtimeError("SHLIACH_BROWSER_REQUEST_UNKNOWN", "Unknown Shliach browser request.", null, 404);
		},
	};
}

function requireVerifiedAgent(context) {
	const identity = context.identity;
	if (identity && identity.assurance === "verified" && identity.accountId) {
		return String(identity.accountId);
	}
	throw new RealtimeError(
		"SHLIACH_BROWSER_AUTH_REQUIRED",
		"Only a signed-in Awtsmoos account can create a browser pairing code.",
		null,
		401
	);
}

function createRoom(context, rooms) {
	const accountId = requireVerifiedAgent(context);
	const room = rooms.create(accountId, context.client);
	return response("shliach.created", { code: room.code, expiresAt: room.expiresAt });
}

function joinRoom(context, payload, rooms) {
	if (!payload || typeof payload.code !== "string" || !payload.code.trim()) {
		throw new RealtimeError("SHLIACH_BROWSER_CODE_REQUIRED", "A pairing code is required.", null, 400);
	}
	if (payload.role && payload.role !== "browser") {
		throw new RealtimeError("SHLIACH_BROWSER_ROLE_INVALID", "Only a browser joins with a code; the agent creates one.", null, 400);
	}
	const joined = rooms.join(payload.code, context.client);
	if (!joined.ok) {
		const code = joined.reason === "already-paired" ? "SHLIACH_BROWSER_ALREADY_PAIRED" : "SHLIACH_BROWSER_CODE_INVALID";
		const message = joined.reason === "already-paired"
			? "This code is already paired with a browser."
			: "Pairing code not found or expired. Ask your AI for a fresh code.";
		throw new RealtimeError(code, message, null, joined.reason === "already-paired" ? 409 : 404);
	}
	const room = joined.room;
	// Tell the agent its browser arrived.
	if (room.agentClient && room.agentClient !== context.client) {
		context.sendEvent(room.agentClient, "shliach.browser-joined", { code: room.code });
	}
	return response("shliach.joined", { code: room.code, paired: true });
}

function sendToPeer(context, payload, rooms) {
	if (!payload || payload.data === undefined) {
		throw new RealtimeError("SHLIACH_BROWSER_DATA_REQUIRED", "shliach.send needs a data field.", null, 400);
	}
	const peer = rooms.peerOf(context.client);
	if (!peer) {
		throw new RealtimeError("SHLIACH_BROWSER_NO_PEER", "No peer is paired to this code yet.", null, 409);
	}
	const role = rooms.roleOf(context.client);
	context.sendEvent(peer, "shliach.message", { from: role, data: payload.data });
	return response("shliach.sent", { delivered: true });
}

function leaveRoom(context, rooms) {
	const peer = rooms.peerOf(context.client);
	const role = rooms.roleOf(context.client);
	const left = rooms.leave(context.client);
	if (!left) return response("shliach.left", { left: false });
	if (peer) {
		context.sendEvent(peer, "shliach.peer-left", { role });
	}
	return response("shliach.left", { left: true, closed: left.closed });
}

function statusOf(context, rooms) {
	const room = rooms.roomOf(context.client);
	if (!room) return response("shliach.status", { paired: false, role: null, code: null });
	const role = rooms.roleOf(context.client);
	const peer = rooms.peerOf(context.client);
	return response("shliach.status", { paired: !!peer, role, code: room.code });
}

function response(type, payload) {
	return { type, payload };
}

module.exports = { createShliachBrowserApplication };
