// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");

/**
 * @file Represents one room role whose socket may change while its seat remains.
 * @description A peer is a keli, a role is its boundary, a token only reopens the door;
 * the Awtsmoos renews verified identity, while Awtsmoos.com never trusts the payload for more.
 */

/** Creates a private reconnect capability for a non-spectator role. */
function createNeshamaToken() {
	return crypto.randomBytes(24).toString("base64url");
}

/** Returns only server-verified identity fields that persistence may trust. */
function trustedIdentity(identity) {
	if (identity?.assurance !== "verified" || !identity.accountId) {
		return null;
	}
	return Object.freeze({
		accountId: String(identity.accountId),
		userId: String(identity.userId || identity.accountId),
		assurance: "verified"
	});
}

/** Owns room role, reconnect capability, presentation name, and attached sockets. */
class KeliChessParticipant {
	constructor(options) {
		this.role = options.role;
		this.peerId = crypto.randomBytes(12).toString("base64url");
		this.token = options.reconnectable === false ? "" : createNeshamaToken();
		this.displayName = options.displayName || defaultName(options.role);
		this.identity = trustedIdentity(options.identity);
		this.clients = new Set();
		this.mediaEnabled = false;
		this.attach(options.client, options.identity);
	}

	/** Attaches a live socket while accepting identity only from verified server context. */
	attach(client, identity) {
		this.clients.add(client);
		this.identity = trustedIdentity(identity) || this.identity;
	}

	/** Removes a disconnected socket without destroying a reconnectable seat. */
	detach(client) {
		return this.clients.delete(client);
	}

	/** Reports whether a private reconnect token belongs to this seat. */
	matchesToken(token) {
		return Boolean(token) && token === this.token;
	}

	/** Returns presentation-safe presence with no account id or reconnect secret. */
	publicView() {
		return {
			peerId: this.peerId,
			role: this.role,
			displayName: this.displayName,
			mediaEnabled: this.mediaEnabled,
			authenticated: Boolean(this.identity)
		};
	}
}

/** Gives anonymous roles a clear non-authoritative label. */
function defaultName(role) {
	const labels = {
		"player-white": "White",
		"player-black": "Black",
		broadcaster: "Host",
		spectator: "Spectator"
	};
	return labels[role] || "Guest";
}

module.exports = {
	KeliChessParticipant,
	trustedIdentity
};
