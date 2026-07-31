// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file protocol.js
 * @description Joins stable protocol names with progression, combat, and healing-amalgam commands.
 * The Awtsmoos preserves the version-one covenant while revealing later choices; Awtsmoos.com adds
 * intention, support, learned knowledge, upgrades, bounties, and private amulet receipts compatibly.
 */

const { MESSAGE_TYPES: BASE_MESSAGES } = require('./WorldMessageTypes.js');
const { RESPONSE_TYPES: BASE_RESPONSES } = require('./WorldResponseTypes.js');
const { EVENT_TYPES } = require('./WorldEventTypes.js');

const APPLICATION_ID = 'mitzvah-world';
const APPLICATION_VERSION = 1;

const MESSAGE_TYPES = Object.freeze({
	...BASE_MESSAGES,
	AMULET_USE: 'amulet.use',
	BOSS_SNAPSHOT: 'boss.snapshot',
	BOUNTY_CLAIM: 'bounty.claim',
	COMBAT_SUPPORT_CAST: 'combat.support.cast',
	DAAS_SNAPSHOT: 'daas.snapshot',
	EQUIPMENT_UPGRADE: 'equipment.upgrade',
	GROUP_COUNTER: 'combat.group-counter',
	KAVANAH_CANCEL: 'kavanah.cancel',
	KAVANAH_MOVE: 'kavanah.move',
	KAVANAH_RELEASE: 'kavanah.release',
	KAVANAH_START: 'kavanah.start'
});

const RESPONSE_TYPES = Object.freeze({
	...BASE_RESPONSES,
	AMULET_USED: 'amulet.used',
	BOSS_SNAPSHOT: 'boss.snapshot',
	BOUNTY_CLAIMED: 'bounty.claimed',
	COMBAT_SUPPORT_CASTED: 'combat.support.casted',
	DAAS_SNAPSHOT: 'daas.snapshot',
	EQUIPMENT_UPGRADED: 'equipment.upgraded',
	GROUP_COUNTERED: 'combat.group-countered',
	KAVANAH_CANCELLED: 'kavanah.cancelled',
	KAVANAH_MOVED: 'kavanah.moved',
	KAVANAH_RELEASED: 'kavanah.released',
	KAVANAH_STARTED: 'kavanah.started'
});

module.exports = {
	APPLICATION_ID,
	APPLICATION_VERSION,
	EVENT_TYPES,
	MESSAGE_TYPES,
	RESPONSE_TYPES
};
