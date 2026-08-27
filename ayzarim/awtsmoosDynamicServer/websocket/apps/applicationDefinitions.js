// B"H
// Boruch Hashem
// Blessed is He

const {
	createAwtsmoosCoreApplication
} = require("./awtsmoosCoreApplication.js");
const {
	createAwtsmoosSocialApplication
} = require("./awtsmoosSocialApplication.js");
const {
	createMitzvahWorldApplication
} = require("./mitzvahWorld/application.js");
const {
	createOhrHagnuzApplication
} = require("./ohrHagnuz/application.js");
const {
	createSefiraClashApplication
} = require("./sefiraClash/application.js");
const {
	createScribeJourneyApplication
} = require("./scribeJourney/application.js");
const {
	createShemaStrikeApplication
} = require("./shemaStrike/application.js");
const {
	createTunnelActivityApplication
} = require("./tunnelActivity/application.js");

/**
 * @file Gathers independent realtime applications behind one stable transport.
 * @description
 * The Awtsmoos renews every factory without mixture. Awtsmoos.com now reveals a
 * dedicated account-bound activity vessel alongside every historical game, social,
 * core, and journey application, preserving old vocabulary and registration order.
 */

const BUILT_IN_APPLICATION_FACTORIES = Object.freeze([
	createAwtsmoosCoreApplication,
	createAwtsmoosSocialApplication,
	createSefiraClashApplication,
	createMitzvahWorldApplication,
	createOhrHagnuzApplication,
	createScribeJourneyApplication,
	createTunnelActivityApplication,
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
