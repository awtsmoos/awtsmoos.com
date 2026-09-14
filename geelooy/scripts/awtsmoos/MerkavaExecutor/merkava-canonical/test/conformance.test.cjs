//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const {
	CONFORMANCE_GATES,
	evaluateConformance
} = require('../index.js');

/**
 * Proves missing suites block release and complete observed suites can pass.
 */
function run() {
	const missing = evaluateConformance({
		container: { passed: 4, total: 4 }
	});
	assert.equal(missing.ok, false);
	assert.ok(missing.failed.includes('webgl2'));
	const allGreen = Object.fromEntries(
		CONFORMANCE_GATES.map(item => [item.id, {
			passed: 10,
			total: 10
		}])
	);
	const ready = evaluateConformance(allGreen);
	assert.equal(ready.ok, true);
	assert.deepEqual(ready.failed, []);
	console.log(JSON.stringify({
		gateCount: CONFORMANCE_GATES.length,
		missingSuitesBlockRelease: true,
		ok: true
	}));
}

run();
