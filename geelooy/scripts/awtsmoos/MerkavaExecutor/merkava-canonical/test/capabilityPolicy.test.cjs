//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const {
	assessCapabilities,
	compileCanonicalProject,
	runCanonicalProject
} = require('../index.js');

/**
 * Proves declared native privileges fail closed until the host grants them.
 */
async function run() {
	const bytes = await compileCanonicalProject({
		capabilities: ['network.fetch'],
		files: {
			'/index.html': '<main id="app">BH</main>'
		}
	});
	const denied = assessCapabilities(['network.fetch'], []);
	assert.equal(denied.ok, false);
	assert.deepEqual(denied.missing, ['network.fetch']);
	assert.throws(
		() => runCanonicalProject(bytes),
		/merkava_capability_denied:network.fetch/
	);
	const result = runCanonicalProject(bytes, {
		availableCapabilities: ['network.fetch']
	});
	assert.equal(result.ok, true);
	console.log(JSON.stringify({
		deniedWithoutGrant: true,
		grantedWithHostCapability: true,
		ok: true
	}));
}

run().catch(error => {
	console.error(error.stack || error.message);
	process.exitCode = 1;
});
