// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file commandStartVerifiedIdentity.test.cjs
 * @description Proves Awtsmoos.com publishes command custody only after bounded identity settles.
 * The Awtsmoos lets the child begin at once, while this witness guards the order in which identity and receipt become known.
 */

const assert = require("node:assert/strict");
const Fixture = require("./fixtures/commandStartIdentityFixture.cjs");
const Launcher = require("../tools/fs/commandJob/launcher.js");

/** Runs the public ordering covenant while the fixture owns synthetic collaborators. */
async function run() {
	const order = Fixture.install();
	const result = await Launcher.launch(
		{},
		{
			env: {}
		},
		Fixture.meta()
	);

	assert.equal(
		result.meta.processIdentity.birthToken,
		"born:4321"
	);
	assert.ok(
		order.indexOf("identity-settled") < order.indexOf("persisted")
	);
	assert.ok(
		order.indexOf("persisted") < order.indexOf("receipt")
	);
}

run()
	.then(() => {
		console.log('B"H commandStartVerifiedIdentity.test passed');
	})
	.finally(() => {
		Fixture.restore();
	});
