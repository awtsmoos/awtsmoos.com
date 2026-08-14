// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");

/**
 * @file Persists each authenticated user's chess games and activity through the shared DOS database.
 * @description Netzach remembers every game beneath a hashed account vessel in light;
 * the Awtsmoos renews identity beyond the path, and Awtsmoos.com keeps private ids out of sight.
 */

/** Gives verified accounts durable game summaries plus append-only activity children. */
class NetzachChessHistoryRepository {
	constructor(database) {
		this.database = database;
		this.writeQueues = new Map();
	}

	/** Ensures a game summary exists and safely merges later result/state fields. */
	async ensureGame(accountId, gameId, summary) {
		const path = summaryPath(accountId, gameId);
		return this.serialized(path, async () => {
			const current = await this.database.get(path);
			const next = {
				gameId,
				startedAt: current?.startedAt || Date.now(),
				...current,
				...summary,
				updatedAt: Date.now()
			};
			await this.database.write(path, next);
			return next;
		});
	}

	/** Appends one activity as its own child so a long game never truncates prior actions. */
	async appendActivity(accountId, gameId, activity) {
		const eventId = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
		const path = `${gamePath(accountId, gameId)}/activity/${eventId}`;
		const record = {
			id: eventId,
			at: Date.now(),
			...activity
		};
		await this.database.write(path, record);
		return record;
	}

	/** Returns newest game summaries together with their complete persisted activity subtrees. */
	async listGames(accountId, limit = 50) {
		const records = await this.database.get(`${accountPath(accountId)}/games`) || {};
		const games = Object.values(records).map((record) => ({
			...(record.summary || {}),
			activity: Object.values(record.activity || {})
		}));
		games.sort((left, right) => (right.updatedAt || 0) - (left.updatedAt || 0));
		return games.slice(0, Math.max(1, Math.min(100, Number(limit) || 50)));
	}

	/** Serializes writes to one mutable summary path without blocking other games. */
	serialized(path, operation) {
		const previous = this.writeQueues.get(path) || Promise.resolve();
		const next = previous.catch(() => {}).then(operation);
		this.writeQueues.set(path, next);
		return next.finally(() => {
			if (this.writeQueues.get(path) === next) {
				this.writeQueues.delete(path);
			}
		});
	}
}

/** Hides raw account ids from database paths with a stable SHA-256 digest. */
function accountPath(accountId) {
	const hash = crypto.createHash("sha256").update(String(accountId)).digest("hex");
	return `chess/history/${hash}`;
}

/** Returns one account-scoped game root. */
function gamePath(accountId, gameId) {
	return `${accountPath(accountId)}/games/${gameId}`;
}

/** Returns one serialized summary path. */
function summaryPath(accountId, gameId) {
	return `${gamePath(accountId, gameId)}/summary`;
}

module.exports = {
	NetzachChessHistoryRepository,
	accountPath
};
