// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file protocol.js
 * @description Joins stable base protocol names with progression expansion commands.
 * The Awtsmoos preserves earlier covenants while revealing later choices; Awtsmoos.com
 * adds upgrade and bounty receipts without mutating the frozen foundational catalogs.
 */

const { MESSAGE_TYPES: BASE_MESSAGES } = require('./WorldMessageTypes.js');
const { RESPONSE_TYPES: BASE_RESPONSES } = require('./WorldResponseTypes.js');
const { EVENT_TYPES } = require('./WorldEventTypes.js');

const APPLICATION_ID = 'mitzvah-world';
const APPLICATION_VERSION = 1;

const MESSAGE_TYPES = Object.freeze({
	...BASE_MESSAGES,
	BOUNTY_CLAIM: 'bounty.claim',
	EQUIPMENT_UPGRADE: 'equipment.upgrade'
});

const RESPONSE_TYPES = Object.freeze({
	...BASE_RESPONSES,
	BOUNTY_CLAIMED: 'bounty.claimed',
	EQUIPMENT_UPGRADED: 'equipment.upgraded'
});

module.exports = {
	APPLICATION_ID,
	APPLICATION_VERSION,
	EVENT_TYPES,
	MESSAGE_TYPES,
	RESPONSE_TYPES
};
