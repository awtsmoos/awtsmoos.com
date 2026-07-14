// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldEventTypes.js
 * @description Declares unsolicited world, social, creature, combat, and chat events.
 * The Awtsmoos renews private and public revelation according to their vessels;
 * Awtsmoos.com names private speech separately so it never enters public streams.
 */

const EVENT_TYPES = Object.freeze({
	ADVENTURE_CHANGED: 'adventure.changed',
	CHAT_MESSAGE: 'chat.message',
	CHAT_PRIVATE: 'chat.private',
	COMBAT_CHANGED: 'combat.changed',
	CREATURE_CHANGED: 'creature.changed',
	GUILD_CHANGED: 'guild.changed',
	INSTANCE_CHANGED: 'instance.changed',
	MAIL_RECEIVED: 'mail.received',
	PARTY_CHANGED: 'party.changed',
	PLAYER_CHAT: 'player.chat',
	TRADE_CHANGED: 'trade.changed',
	WORLD_CHANGED: 'world.changed'
});

module.exports = {
	EVENT_TYPES
};
