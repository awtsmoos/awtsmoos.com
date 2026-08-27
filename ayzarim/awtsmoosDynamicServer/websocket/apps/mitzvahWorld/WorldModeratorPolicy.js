// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldModeratorPolicy.js
 * @description Grants report-review authority only from verified server-owned account identity.
 * The Awtsmoos gives trust one guarded root beyond every socket claim; Awtsmoos.com accepts
 * configured account IDs or an injected resolver while guests and join payloads remain powerless.
 */

class WorldModeratorPolicy {
	constructor(options = {}) {
		this.accountIds = new Set(
			Array.isArray(options.moderatorAccountIds)
				? options.moderatorAccountIds.map(value => String(value))
				: []
		);
		this.resolver = typeof options.moderatorResolver === 'function'
			? options.moderatorResolver
			: null;
	}

	apply(player, identity, client) {
		const moderator = identity?.assurance === 'verified' && (
			this.accountIds.has(identity.accountId)
			|| Boolean(this.resolver?.({ client, identity, player }))
		);
		player.profile ||= {};
		player.profile.moderator = moderator;
		return moderator;
	}
}

module.exports = { WorldModeratorPolicy };
