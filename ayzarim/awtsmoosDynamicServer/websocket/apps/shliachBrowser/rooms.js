// B"H
// Boruch Hashem
// Blessed is He

const { CODE_LENGTH, CODE_TTL_MS } = require("./protocol.js");

// Unambiguous alphabet: no I, O, 0, or 1, so a code read aloud cannot be
// mistaken for another character.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Holds pairing-code rooms for the Shliach browser relay.
 *
 * A room is created by an OAuth-verified agent and holds one agent peer
 * plus at most one browser peer. The browser joins with the short code —
 * the code IS the browser's authorization; no token lives in the
 * extension. A code expires CODE_TTL_MS after creation, pairs exactly one
 * browser, and dies when the agent leaves or disconnects. If the browser
 * disconnects, the room survives so it can rejoin with the same code
 * while the code is still valid.
 */
class ShliachBrowserRooms {
	constructor(options = {}) {
		this.rooms = new Map(); // code -> room
		this.byClient = new Map(); // client -> { code, role }
		this.byAccount = new Map(); // accountId -> code
		this.now = options.now || (() => Date.now());
		this.random = options.random || Math.random;
	}

	generateCode() {
		let code = "";
		for (let i = 0; i < CODE_LENGTH; i += 1) {
			code += CODE_ALPHABET[Math.floor(this.random() * CODE_ALPHABET.length)];
		}
		return code;
	}

	create(accountId, agentClient) {
		this.pruneExpired();
		const oldCode = this.byAccount.get(accountId);
		if (oldCode) this.close(oldCode);
		let code = this.generateCode();
		while (this.rooms.has(code)) code = this.generateCode();
		const now = this.now();
		const room = {
			code,
			accountId,
			createdAt: now,
			expiresAt: now + CODE_TTL_MS,
			agentClient,
			browserClient: null,
		};
		this.rooms.set(code, room);
		this.byAccount.set(accountId, code);
		this.byClient.set(agentClient, { code, role: "agent" });
		return room;
	}

	join(code, browserClient) {
		const clean = String(code || "").trim().toUpperCase();
		const room = this.rooms.get(clean);
		if (!room) return { ok: false, reason: "code-not-found" };
		if (room.expiresAt <= this.now()) {
			this.close(clean);
			return { ok: false, reason: "code-expired" };
		}
		if (room.browserClient && room.browserClient !== browserClient) {
			return { ok: false, reason: "already-paired" };
		}
		room.browserClient = browserClient;
		this.byClient.set(browserClient, { code: clean, role: "browser" });
		return { ok: true, room };
	}

	leave(client) {
		const entry = this.byClient.get(client);
		if (!entry) return null;
		this.byClient.delete(client);
		const room = this.rooms.get(entry.code);
		if (!room) return { code: entry.code, role: entry.role, closed: true };
		if (entry.role === "agent") {
			// The agent is the authenticated anchor. When it leaves, the
			// pairing ends: close the room so the code cannot be reused.
			this.close(entry.code);
			return { code: entry.code, role: entry.role, closed: true };
		}
		// The browser leaving only unpairs it; the room survives so it can
		// rejoin with the same code while the code is still valid.
		room.browserClient = null;
		return { code: entry.code, role: entry.role, closed: false };
	}

	peerOf(client) {
		const entry = this.byClient.get(client);
		if (!entry) return null;
		const room = this.rooms.get(entry.code);
		if (!room) return null;
		return entry.role === "agent" ? room.browserClient : room.agentClient;
	}

	roomOf(client) {
		const entry = this.byClient.get(client);
		if (!entry) return null;
		return this.rooms.get(entry.code) || null;
	}

	roleOf(client) {
		const entry = this.byClient.get(client);
		return entry ? entry.role : null;
	}

	close(code) {
		const room = this.rooms.get(code);
		if (!room) return;
		this.rooms.delete(code);
		if (this.byAccount.get(room.accountId) === code) this.byAccount.delete(room.accountId);
		if (room.agentClient) this.byClient.delete(room.agentClient);
		if (room.browserClient) this.byClient.delete(room.browserClient);
	}

	closeAll() {
		for (const code of [...this.rooms.keys()]) this.close(code);
	}

	pruneExpired() {
		const now = this.now();
		for (const [code, room] of [...this.rooms.entries()]) {
			if (room.expiresAt <= now) this.close(code);
		}
	}

	size() {
		return this.rooms.size;
	}
}

module.exports = { ShliachBrowserRooms };
