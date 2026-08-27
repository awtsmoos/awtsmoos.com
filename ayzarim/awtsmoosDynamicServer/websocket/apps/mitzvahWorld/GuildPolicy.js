// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GuildPolicy.js
 * @description Guards guild existence, membership, naming, and leader authority.
 * The Awtsmoos renews community through ordered responsibility; Awtsmoos.com
 * requires explicit invitation and leadership before a guild record may change.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const NAME_PATTERN = /^[A-Za-z0-9 ':-]{3,48}$/;

function requireGuild(guilds, guildId) {
	const guild = guilds.get(guildId);
	if (!guild) throw new RealtimeError('GUILD_NOT_FOUND', 'The requested guild does not exist.');
	return guild;
}

function requireLeader(guilds, player) {
	const guild = requireGuild(guilds, player.guildId);
	if (guild.leaderId !== player.id) {
		throw new RealtimeError('GUILD_LEADER_REQUIRED', 'Only the guild leader may do that.');
	}
	return guild;
}

function requireNoGuild(player) {
	if (player.guildId) throw new RealtimeError('ALREADY_IN_GUILD', 'The player already belongs to a guild.');
}

function validateGuildName(value) {
	const name = String(value || '').trim();
	if (!NAME_PATTERN.test(name)) {
		throw new RealtimeError('INVALID_GUILD_NAME', 'Guild name must contain 3-48 safe characters.');
	}
	return name;
}

function nextGuildNumber(records) {
	return records.reduce((maximum, record) => {
		return Math.max(maximum, Number(record.id.replace('guild-', '')) || 0);
	}, 0) + 1;
}

module.exports = {
	nextGuildNumber,
	requireGuild,
	requireLeader,
	requireNoGuild,
	validateGuildName
};
