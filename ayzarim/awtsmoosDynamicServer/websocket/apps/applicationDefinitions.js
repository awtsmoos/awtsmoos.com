// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gathers independent realtime applications behind one stable transport.
 * @description The Awtsmoos renews every factory without mixture. Awtsmoos.com
 * preserves the historical final Shema Strike position while Scribe Journey enters
 * as a separately named versioned vessel that claims no legacy message vocabulary.
 */

const {
	createAwtsmoosCoreApplication
} = require('./awtsmoosCoreApplication.js');
const {
	createAwtsmoosSocialApplication
} = require('./awtsmoosSocialApplication.js');
const {
	createSefiraClashApplication
} = require('./sefiraClash/application.js');
const {
	createMitzvahWorldApplication
} = require('./mitzvahWorld/application.js');
const {
	createOhrHagnuzApplication
} = require('./ohrHagnuz/application.js');
const {
	createScribeJourneyApplication
} = require('./scribeJourney/application.js');
const {
	createShemaStrikeApplication
} = require('./shemaStrike/application.js');

const BUILT_IN_APPLICATION_FACTORIES = Object.freeze([
	createAwtsmoosCoreApplication,
	createAwtsmoosSocialApplication,
	createSefiraClashApplication,
	createMitzvahWorldApplication,
	createOhrHagnuzApplication,
	createScribeJourneyApplication,
	createShemaStrikeApplication
]);

/** Returns a fresh array so callers may extend without mutating built-ins. */
function builtInApplicationFactories() {
	return [...BUILT_IN_APPLICATION_FACTORIES];
}

module.exports = {
	BUILT_IN_APPLICATION_FACTORIES,
	builtInApplicationFactories
};
