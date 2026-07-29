// B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	builtInApplicationFactories
} = require('./applicationDefinitions.js');
const {
	APPLICATION_ID_PATTERN,
	ApplicationRegistry
} = require('../platform/ApplicationRegistry.js');

test('every built-in realtime application has a routable stable identity', () => {
	const registry = new ApplicationRegistry();
	const applications = builtInApplicationFactories().map(factory => factory());
	try {
		for (const application of applications) {
			assert.match(application.id, APPLICATION_ID_PATTERN);
			registry.register(application);
		}
		assert.equal(
			registry.resolve('mitzvah-world', 1).id,
			'mitzvah-world'
		);
	} finally {
		for (const application of applications) {
			application.stop?.();
			application.scheduler?.stop?.();
		}
	}
});
