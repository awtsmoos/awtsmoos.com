// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMessageTypes.js
 * @description Declares stable version-one MMORPG request names including social chat.
 * The Awtsmoos renews every intention beneath one covenant; Awtsmoos.com preserves
 * earlier names while adding census, channels, histories, and private communication.
 */

const MESSAGE_TYPES = Object.freeze({
	ADVENTURE_LIST: 'adventure.list',
	ADVENTURE_SNAPSHOT: 'adventure.snapshot',
	ADVENTURE_START: 'adventure.start',
	BOT_COMMAND: 'bot.command',
	BOT_REMOVE: 'bot.remove',
	BOT_SPAWN: 'bot.spawn',
	BOT_TICK: 'bot.tick',
	CHAT_CHANNELS: 'chat.channels',
	CHAT_HISTORY: 'chat.history',
	CHAT_SEND: 'chat.send',
	COMBAT_ATTACK: 'combat.attack',
	COMBAT_SNAPSHOT: 'combat.snapshot',
	COMBAT_TICK: 'combat.tick',
	CRAFT_EXECUTE: 'craft.execute',
	CRAFT_RECIPES: 'craft.recipes',
	CREATURE_CARE: 'creature.care',
	CREATURE_SNAPSHOT: 'creature.snapshot',
	ECONOMY_BALANCE: 'economy.balance',
	GUILD_CREATE: 'guild.create',
	GUILD_INVITE: 'guild.invite',
	GUILD_JOIN: 'guild.join',
	GUILD_KICK: 'guild.kick',
	GUILD_LEAVE: 'guild.leave',
	GUILD_SNAPSHOT: 'guild.snapshot',
	HARVEST_PERFORM: 'harvest.perform',
	INSTANCE_ENTER: 'instance.enter',
	INSTANCE_LEAVE: 'instance.leave',
	INSTANCE_SNAPSHOT: 'instance.snapshot',
	MAIL_DELETE: 'mail.delete',
	MAIL_SEND: 'mail.send',
	MAIL_SNAPSHOT: 'mail.snapshot',
	PARTY_CREATE: 'party.create',
	PARTY_INVITE: 'party.invite',
	PARTY_JOIN: 'party.join',
	PARTY_KICK: 'party.kick',
	PARTY_LEAVE: 'party.leave',
	PARTY_SNAPSHOT: 'party.snapshot',
	PLAYER_ACTION: 'player.action',
	PLAYER_CHAT: 'player.chat',
	PLAYER_EMOTE: 'player.emote',
	PLAYER_EQUIPMENT: 'player.equipment',
	PLAYER_INPUT: 'player.input',
	PLAYER_INTERACT: 'player.interact',
	PLAYER_INVENTORY: 'player.inventory',
	PLAYER_PROFILE: 'player.profile',
	PLAYER_RESPAWN: 'player.respawn',
	PRESENCE_QUERY: 'presence.query',
	QUEST_ABANDON: 'quest.abandon',
	QUEST_INTERACT: 'quest.interact',
	QUEST_SNAPSHOT: 'quest.snapshot',
	QUEST_START: 'quest.start',
	REWARD_CLAIM: 'reward.claim',
	SERVER_TIME: 'server.time',
	SESSION_REVOKE: 'session.revoke',
	SESSION_ROTATE: 'session.rotate',
	TRADE_ACCEPT: 'trade.accept',
	TRADE_CANCEL: 'trade.cancel',
	TRADE_CREATE: 'trade.create',
	TRADE_OFFER: 'trade.offer',
	TRADE_SNAPSHOT: 'trade.snapshot',
	VENDOR_BUY: 'vendor.buy',
	VENDOR_SELL: 'vendor.sell',
	WORLD_CENSUS: 'world.census',
	WORLD_HEARTBEAT: 'world.heartbeat',
	WORLD_JOIN: 'world.join',
	WORLD_LEAVE: 'world.leave',
	WORLD_RESYNC: 'world.resync',
	WORLD_SNAPSHOT: 'world.snapshot'
});

module.exports = {
	MESSAGE_TYPES
};
