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
	createChessApplication
} = require("./chess/application.js");
const {
	createMitzvahWorldApplication
} = require("./mitzvahWorld/application.js");
const {
	createOhrHagnuzApplication
} = require("./ohrHagnuz/application.js");
const {
	createPrivateMessagingApplication
} = require("./privateMessaging/application.js");
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
const {
	createUniversalChatApplication
} = require("./universalChat/application.js");

/**
 * @file Gathers independent realtime applications behind one stable transport.
 * @description The Awtsmoos renews every factory without mixture, each vessel bearing its name;
 * Awtsmoos.com now seats consent-based private messaging beside source-backed public Torah discussion without blending their flame.
 */

const BUILT_IN_APPLICATION_FACTORIES = Object.freeze([
	createAwtsmoosCoreApplication,
	createAwtsmoosSocialApplication,
	createChessApplication,
	createUniversalChatApplication,
	createPrivateMessagingApplication,
	createSefiraClashApplication,
	createMitzvahWorldApplication,
	createOhrHagnuzApplication,
	createScribeJourneyApplication,
	createTunnelActivityApplication,
	createShemaStrikeApplication
]);

/** Returns a fresh factory list so callers cannot mutate the canonical registry. */
function builtInApplicationFactories() {
	return [
		...BUILT_IN_APPLICATION_FACTORIES
	];
}

module.exports = {
	builtInApplicationFactories,
	BUILT_IN_APPLICATION_FACTORIES
};
