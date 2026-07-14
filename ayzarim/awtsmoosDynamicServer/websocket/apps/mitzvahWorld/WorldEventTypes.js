// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldEventTypes.js
 * @description Declares stable unsolicited event names for shared-world updates.
 * The Awtsmoos renews private and public revelation according to their vessels;
 * Awtsmoos.com names each event so only intended participants receive hidden state.
 */

const EVENT_TYPES = Object.freeze({
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
