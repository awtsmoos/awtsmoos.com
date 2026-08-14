// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");

/**
 * @file Owns private history-only chess games that never become social rooms.
 * @description The Awtsmoos renews a private game without opening its board to public sight;
 * Awtsmoos.com remembers the verified player's path while privacy keeps its boundary bright.
 */

/** Records private local/AI game history through an already account-scoped repository. */
class MalchusStandaloneHistoryRecorder {
	constructor(repository) {
		this.repository = repository;
	}

	/** Creates one server-issued private game id for a verified account. */
	async start(identity, mode, title) {
		if (!trustedAccount(identity) || !this.repository) {
			return {
				authenticated: false,
				gameId: ""
			};
		}
		const gameId = `local-${crypto.randomBytes(18).toString("base64url")}`;
		await this.repository.ensureGame(identity.accountId, gameId, {
			mode,
			title,
			role: "local-player",
			visibility: "private-history",
			result: null
		});
		await this.repository.appendActivity(identity.accountId, gameId, {
			type: "game.started"
		});
		return {
			authenticated: true,
			gameId
		};
	}

	/** Appends one private activity and updates the summary when the game finishes. */
	async record(identity, gameId, type, details = {}) {
		if (!trustedAccount(identity) || !this.repository || !gameId) {
			return false;
		}
		await this.repository.appendActivity(identity.accountId, gameId, {
			type,
			details
		});
		if (type === "game.finished") {
			await this.repository.ensureGame(identity.accountId, gameId, {
				result: details.result || "Finished"
			});
		}
		return true;
	}
}

/** Allows durable personal history only for identity verified at WebSocket upgrade. */
function trustedAccount(identity) {
	return identity?.assurance === "verified" && Boolean(identity.accountId);
}

module.exports = {
	MalchusStandaloneHistoryRecorder,
	trustedAccount
};
