// B"H
// Boruch Hashem
// Blessed is He

const { NetzachChessHistoryRepository } = require("./historyRepository.js");
const { TiferesRoomHistoryRecorder } = require("./roomHistoryRecorder.js");
const {
	MalchusStandaloneHistoryRecorder,
	trustedAccount
} = require("./standaloneHistoryRecorder.js");

/**
 * @file Composes room history, private local-game history, and current-account history reads.
 * @description The Awtsmoos renews memory through several small vessels whose boundaries remain clear;
 * Awtsmoos.com lets gameplay continue even when persistence disappears or draws near.
 */

/** Coordinates durable chess history while converting storage failure into non-fatal results. */
class HodChessActivityRecorder {
	constructor(database) {
		this.repository = database
			? new NetzachChessHistoryRepository(database)
			: null;
		this.safe = this.safe.bind(this);
		this.roomHistory = new TiferesRoomHistoryRecorder(
			this.repository,
			this.safe
		);
		this.standalone = new MalchusStandaloneHistoryRecorder(this.repository);
	}

	/** Records one room admission for a verified participant. */
	join(participant, room, type) {
		return this.roomHistory.join(participant, room, type);
	}

	/** Appends one verified room participant activity. */
	record(participant, room, type, details = {}) {
		return this.roomHistory.record(participant, room, type, details);
	}

	/** Persists one finished room for every authenticated non-spectator controller. */
	finish(room) {
		return this.roomHistory.finish(room);
	}

	/** Starts one private history-only local or AI game. */
	async startStandalone(identity, mode, title) {
		try {
			return await this.standalone.start(identity, mode, title);
		} catch (error) {
			console.error("Private chess history start failed:", error?.message || error);
			return {
				authenticated: trustedAccount(identity),
				gameId: ""
			};
		}
	}

	/** Records one private history-only activity without allowing storage to affect play. */
	recordStandalone(identity, gameId, type, details = {}) {
		return this.safe(() => this.standalone.record(
			identity,
			gameId,
			type,
			details
		));
	}

	/** Returns durable history only for the verified current socket account. */
	async list(identity, limit) {
		if (!trustedAccount(identity) || !this.repository) {
			return {
				authenticated: false,
				games: []
			};
		}
		try {
			const games = await this.repository.listGames(identity.accountId, limit);
			return {
				authenticated: true,
				games
			};
		} catch (error) {
			console.error("Chess history read failed:", error?.message || error);
			return {
				authenticated: true,
				games: []
			};
		}
	}

	/** Converts any persistence rejection into false instead of a realtime/gameplay rejection. */
	async safe(operation) {
		try {
			await operation();
			return true;
		} catch (error) {
			console.error("Chess history persistence failed:", error?.message || error);
			return false;
		}
	}
}

module.exports = {
	HodChessActivityRecorder
};
