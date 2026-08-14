// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { read, remove, values, write } = require("./database.js");
const { paths } = require("./paths.js");

/**
 * @file Owns mutual friendships, unilateral blocks, and per-request permission policy.
 * @description The Awtsmoos renews connection and boundary alike; blocking outranks invitation while friendship remains mutual light;
 * Awtsmoos.com keeps public follows separate from private consent so different social meanings never blur in sight.
 */

const DEFAULTS = Object.freeze({
	chat: "everyone",
	whisper: "everyone",
	friend: "everyone",
	"group-invite": "friends",
	mail: "everyone"
});
const ALLOWED_POLICIES = new Set(["everyone", "friends", "nobody"]);

class GevurahRelationshipRepository {
	constructor(database) {
		this.database = database;
	}

	async areFriends(left, right) {
		return Boolean(await read(this.database, paths.friend(left, right)));
	}

	async isBlocked(left, right) {
		return Boolean(await read(this.database, paths.block(left, right)));
	}

	async blockedEither(left, right) {
		return await this.isBlocked(left, right) || await this.isBlocked(right, left);
	}

	async setFriends(left, right) {
		const now = Date.now();
		await write(this.database, paths.friend(left.accountKey, right.accountKey), {
			alias: right.alias,
			since: now
		});
		await write(this.database, paths.friend(right.accountKey, left.accountKey), {
			alias: left.alias,
			since: now
		});
	}

	async setBlock(actor, target, blocked) {
		if (!blocked) {
			await remove(this.database, paths.block(actor.accountKey, target.accountKey));
			return;
		}
		await write(this.database, paths.block(actor.accountKey, target.accountKey), {
			alias: target.alias,
			since: Date.now()
		});
		await remove(this.database, paths.friend(actor.accountKey, target.accountKey));
		await remove(this.database, paths.friend(target.accountKey, actor.accountKey));
	}

	async getSettings(accountKey) {
		const stored = await read(this.database, paths.settings(accountKey), {});
		return {
			allowRequests: {
				...DEFAULTS,
				...(stored.allowRequests || {})
			}
		};
	}

	async setSettings(accountKey, value) {
		const current = await this.getSettings(accountKey);
		for (const [kind, policy] of Object.entries(value.allowRequests || {})) {
			if (!(kind in DEFAULTS) || !ALLOWED_POLICIES.has(policy)) {
				throw new RealtimeError(
					"PRIVATE_MESSAGING_SETTINGS_INVALID",
					"Request setting is invalid."
				);
			}
			current.allowRequests[kind] = policy;
		}
		return write(this.database, paths.settings(accountKey), current);
	}

	async canRequest(sender, target, kind) {
		if (await this.blockedEither(sender.accountKey, target.accountKey)) {
			return false;
		}
		const settings = await this.getSettings(target.accountKey);
		const policy = settings.allowRequests[kind] || "nobody";
		if (policy === "everyone") {
			return true;
		}
		if (policy === "nobody") {
			return false;
		}
		return this.areFriends(sender.accountKey, target.accountKey);
	}

	async list(accountKey) {
		return {
			friends: values(await read(this.database, paths.friends(accountKey), {})),
			blocks: values(await read(this.database, paths.blocks(accountKey), {})),
			settings: await this.getSettings(accountKey)
		};
	}
}

module.exports = {
	DEFAULTS,
	GevurahRelationshipRepository
};
