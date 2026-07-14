// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldResponseTypes.js
 * @description Declares stable version-one success names across MMORPG families.
 * The Awtsmoos renews every answer without erasing prior covenants; Awtsmoos.com
 * keeps each response explicit for clients, tests, telemetry, and future migration.
 */

const RESPONSE_TYPES = Object.freeze({
	BOT_COMMAND_ACCEPTED: 'bot.command.accepted',
	BOT_REMOVED: 'bot.removed',
	BOT_SPAWNED: 'bot.spawned',
	BOT_TICKED: 'bot.ticked',
	CRAFT_COMPLETED: 'craft.completed',
	CRAFT_RECIPES: 'craft.recipes',
	ECONOMY_BALANCE: 'economy.balance',
	GUILD_CREATED: 'guild.created',
	GUILD_INVITED: 'guild.invited',
	GUILD_JOINED: 'guild.joined',
	GUILD_KICKED: 'guild.kicked',
	GUILD_LEFT: 'guild.left',
	GUILD_SNAPSHOT: 'guild.snapshot',
	INSTANCE_ENTERED: 'instance.entered',
	INSTANCE_LEFT: 'instance.left',
	INSTANCE_SNAPSHOT: 'instance.snapshot',
	INPUT_ACCEPTED: 'player.input.accepted',
	MAIL_DELETED: 'mail.deleted',
	MAIL_SENT: 'mail.sent',
	MAIL_SNAPSHOT: 'mail.snapshot',
	PARTY_CREATED: 'party.created',
	PARTY_INVITED: 'party.invited',
	PARTY_JOINED: 'party.joined',
	PARTY_KICKED: 'party.kicked',
	PARTY_LEFT: 'party.left',
	PARTY_SNAPSHOT: 'party.snapshot',
	PLAYER_ACTION_ACCEPTED: 'player.action.accepted',
	PLAYER_CHAT_ACCEPTED: 'player.chat.accepted',
	PLAYER_EMOTE_ACCEPTED: 'player.emote.accepted',
	PLAYER_EQUIPMENT: 'player.equipment',
	PLAYER_INTERACTION: 'player.interaction',
	PLAYER_INVENTORY: 'player.inventory',
	PLAYER_PROFILE: 'player.profile',
	PLAYER_RESPAWNED: 'player.respawned',
	PRESENCE_RESULT: 'presence.result',
	QUEST_ABANDONED: 'quest.abandoned',
	QUEST_ADVANCED: 'quest.advanced',
	QUEST_SNAPSHOT: 'quest.snapshot',
	QUEST_STARTED: 'quest.started',
	REWARD_CLAIMED: 'reward.claimed',
	SERVER_TIME: 'server.time',
	SESSION_REVOKED: 'session.revoked',
	SESSION_ROTATED: 'session.rotated',
	TRADE_ACCEPTED: 'trade.accepted',
	TRADE_CANCELLED: 'trade.cancelled',
	TRADE_CREATED: 'trade.created',
	TRADE_OFFERED: 'trade.offered',
	TRADE_SNAPSHOT: 'trade.snapshot',
	VENDOR_BOUGHT: 'vendor.bought',
	VENDOR_SOLD: 'vendor.sold',
	WORLD_HEARTBEAT: 'world.heartbeat',
	WORLD_JOINED: 'world.joined',
	WORLD_LEFT: 'world.left',
	WORLD_RESYNCED: 'world.resynced',
	WORLD_SNAPSHOT: 'world.snapshot'
});

module.exports = {
	RESPONSE_TYPES
};
