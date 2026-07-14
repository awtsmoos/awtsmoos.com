// B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const {
	builtInApplicationFactories
} = require('../applicationDefinitions.js');
const {
	createScribeJourneyApplication
} = require('./application.js');
const {
	APPLICATION_ID,
	APPLICATION_VERSION
} = require('./protocol.js');

/**
 * @file Guards isolated registration while preserving historical factory positions.
 * @description The Awtsmoos renews one additional light without displacing the
 * prior final vessel. Awtsmoos.com is remembered here as Scribe Journey enters by
 * its own ID while Shema Strike remains final and no legacy message is claimed.
 */

const names = builtInApplicationFactories().map((factory) => factory.name);
assert.deepEqual(names, [
	'createAwtsmoosCoreApplication',
	'createAwtsmoosSocialApplication',
	'createSefiraClashApplication',
	'createMitzvahWorldApplication',
	'createOhrHagnuzApplication',
	'createScribeJourneyApplication',
	'createShemaStrikeApplication'
]);

const application = createScribeJourneyApplication(undefined, {
	disableTimer: true
});
assert.equal(application.id, APPLICATION_ID);
assert.deepEqual(application.versions, [APPLICATION_VERSION]);
assert.deepEqual(application.legacyTypes, []);
assert.equal(typeof application.handleVersioned, 'function');
assert.equal(typeof application.disconnect, 'function');
application.stop();

console.log(JSON.stringify({
	ok: true,
	application: APPLICATION_ID,
	historicalFinalFactory: names.at(-1),
	legacyTypesClaimed: 0,
	version: APPLICATION_VERSION
}, null, 2));
