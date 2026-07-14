// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GuildMembershipService.js
 * @description Applies invitation, join, leave, and leader-authorized kick rules.
 * The Awtsmoos renews community through willing membership; Awtsmoos.com keeps
 * consent and authority explicit before any guild relationship may be transformed.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const {
	requireGuild,
	requireLeader,
	requireNoGuild
} = require('./GuildPolicy.js');
const MAXIMUM_GUILD_MEMBERS = 100;

class GuildMembershipService {
	constructor(guilds, players) {
		this.guilds = guilds;
		this.players = players;
	}

	invite(actor, targetPlayerId) {
		const guild = requireLeader(this.guilds, actor);
		const target = this.requireHuman(targetPlayerId);
		requireNoGuild(target);
		if (!guild.invites.includes(target.id)) guild.invites.push(target.id);
		return { guildId: guild.id, targetPlayerId: target.id };
	}

	join(player, guildId) {
		requireNoGuild(player);
		const guild = requireGuild(this.guilds, guildId);
		if (!guild.invites.includes(player.id)) {
			throw new RealtimeError('GUILD_INVITE_REQUIRED', 'The player has no invitation to that guild.');
		}
		if (guild.memberIds.length >= MAXIMUM_GUILD_MEMBERS) {
			throw new RealtimeError('GUILD_FULL', 'The guild has reached its member limit.');
		}
		guild.invites = guild.invites.filter(id => id !== player.id);
		guild.memberIds.push(player.id);
		player.guildId = guild.id;
		return guild;
	}

	leave(player) {
		const guild = requireGuild(this.guilds, player.guildId);
		guild.memberIds = guild.memberIds.filter(id => id !== player.id);
		player.guildId = null;
		if (guild.memberIds.length === 0) {
			this.guilds.delete(guild.id);
			return null;
		}
		if (guild.leaderId === player.id) guild.leaderId = guild.memberIds[0];
		return guild;
	}

	kick(actor, targetPlayerId) {
		const guild = requireLeader(this.guilds, actor);
		if (targetPlayerId === actor.id) {
			throw new RealtimeError('GUILD_LEADER_CANNOT_KICK_SELF', 'The leader must leave explicitly.');
		}
		if (!guild.memberIds.includes(targetPlayerId)) {
			throw new RealtimeError('GUILD_MEMBER_NOT_FOUND', 'The target is not in this guild.');
		}
		guild.memberIds = guild.memberIds.filter(id => id !== targetPlayerId);
		this.requireHuman(targetPlayerId).guildId = null;
		return guild;
	}

	requireHuman(playerId) {
		const player = this.players.get(playerId);
		if (!player || player.kind !== 'human') {
			throw new RealtimeError('PLAYER_NOT_FOUND', 'The target player does not exist.');
		}
		return player;
	}
}

module.exports = {
	GuildMembershipService,
	MAXIMUM_GUILD_MEMBERS
};
