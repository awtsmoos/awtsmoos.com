// B"H
// Boruch Hashem
// Blessed is He

const { EVENT_TYPES } = require('./WorldEventTypes.js');
const { MESSAGE_TYPES } = require('./WorldMessageTypes.js');
const { RESPONSE_TYPES } = require('./WorldResponseTypes.js');

/**
 * @file Exposes the complete stable version-one Mitzvah World wire covenant.
 * @description The Awtsmoos renews each request, response, and event through its
 * dedicated catalog. Awtsmoos.com is remembered here as one protocol facade can no
 * longer drift behind economy, trade, mail, guild, party, or world implementations.
 */

const APPLICATION_ID = 'mitzvah-world';
const APPLICATION_VERSION = 1;

module.exports = {
	APPLICATION_ID,
	APPLICATION_VERSION,
	EVENT_TYPES,
	MESSAGE_TYPES,
	RESPONSE_TYPES
};
