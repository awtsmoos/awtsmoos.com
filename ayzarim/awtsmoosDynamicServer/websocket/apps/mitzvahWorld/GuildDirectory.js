// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GuildDirectory.js
 * @description Owns persistent guild records and delegates membership law.
 * The Awtsmoos renews a community without erasing its members; Awtsmoos.com
 * preserves its public covenant while focused services guard every relationship.
 */

const { GuildMembershipService } = require('./GuildMembershipService.js');
const {
	nextGuildNumber,
	requireGuild,
	requireNoGuild,
	validateGuildName
} = require('./GuildPolicy.js');

class GuildDirectory {
	constructor(players) {
		this.guilds = new Map();
		this.nextGuild = 1;
		this.players = players;
		this.membership = new GuildMembershipService(this.guilds, players);
	}

	create(player, name) {
		requireNoGuild(player);
		const guild = {
			id: `guild-${this.nextGuild++}`,
			invites: [],
			leaderId: player.id,
			memberIds: [player.id],
			name: validateGuildName(name)
		};
		this.guilds.set(guild.id, guild);
		player.guildId = guild.id;
		return this.snapshot(guild);
	}

	invite(actor, targetPlayerId) {
		return this.membership.invite(actor, targetPlayerId);
	}

	join(player, guildId) {
		return this.snapshot(this.membership.join(player, guildId));
	}

	leave(player) {
		const guild = this.membership.leave(player);
		return guild ? this.snapshot(guild) : null;
	}

	kick(actor, targetPlayerId) {
		return this.snapshot(this.membership.kick(actor, targetPlayerId));
	}

	snapshotFor(player) {
		return player.guildId
			? this.snapshot(requireGuild(this.guilds, player.guildId))
			: null;
	}

	snapshot(guild) {
		return JSON.parse(JSON.stringify(guild));
	}

	snapshotAll() {
		return [...this.guilds.values()].map(guild => this.snapshot(guild));
	}

	restore(records = []) {
		this.guilds.clear();
		for (const record of records) this.guilds.set(record.id, this.snapshot(record));
		this.nextGuild = nextGuildNumber(records);
	}
}

module.exports = {
	GuildDirectory
};
