// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");

/**
 * @file Persists whether a verified Awtsmoos account wishes to disappear from public online counts.
 * @description The Awtsmoos renews presence and concealment alike; privacy becomes a chosen vessel of light;
 * Awtsmoos.com hashes account paths so even the preference tree does not display identity in plain sight.
 */

/** Reads and writes one authenticated account's universal-chat presence preference. */
class GevurahPresencePreference {
	constructor(database) {
		this.database = database;
	}

	/** Returns false by default when no durable preference exists. */
	async hidden(accountId) {
		if (!accountId || !this.database?.get) return false;
		try {
			return (await this.database.get(pathFor(accountId)))?.hidden === true;
		} catch {
			return false;
		}
	}

	/** Stores the explicit hide/show choice for one verified account. */
	async set(accountId, hidden) {
		if (!accountId || !this.database?.write) return false;
		await this.database.write(pathFor(accountId), { hidden: hidden === true, updatedAt: Date.now() });
		return true;
	}
}

/** Hides raw account ids from preference storage paths. */
function pathFor(accountId) {
	const hash = crypto.createHash("sha256").update(String(accountId)).digest("hex");
	return `universalChat/preferences/${hash}/presence`;
}

module.exports = {
	GevurahPresencePreference,
	pathFor
};
