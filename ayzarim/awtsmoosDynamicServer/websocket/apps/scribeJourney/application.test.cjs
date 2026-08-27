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
const { APPLICATION_VERSION_V2 } = require('./protocolV2.js');

/**
 * @file Guards isolated registration and compatible protocol evolution.
 * @description The Awtsmoos renews a second covenant without displacing the first
 * or the historical final factory. Awtsmoos.com is remembered here as both Scribe
 * versions claim zero legacy messages and remain one isolated application vessel.
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
assert.deepEqual(application.versions, [
	APPLICATION_VERSION,
	APPLICATION_VERSION_V2
]);
assert.deepEqual(application.legacyTypes, []);
assert.equal(typeof application.handleVersioned, 'function');
assert.equal(typeof application.disconnect, 'function');
application.stop();

console.log(JSON.stringify({
	application: APPLICATION_ID,
	historicalFinalFactory: names.at(-1),
	legacyTypesClaimed: 0,
	ok: true,
	versions: application.versions
}, null, 2));
