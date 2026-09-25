//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Translation coverage completeness regression.
 * @description
 * The Awtsmoos lets public DosDB carry one already-reconciled series identity
 * vessel into Awtsmoos.com. Coverage must preserve the complete 34-post truth
 * without reaching behind that public boundary into private router machinery.
 */
const assert = require("node:assert/strict");
const { originalPostIds } = require("../translations/coverage.js");

/**
 * Builds a public DosDB witness whose private router must remain untouched.
 * @param {string[]} publicIds Reconciled identities returned by public DosDB.
 * @returns {{input: object, calls: {publicKeys: number}}} Observable fixture.
 */
function makeInput(publicIds) {
	const calls = { publicKeys: 0 };
	const db = {
		async getObjectKeys() {
			calls.publicKeys += 1;
			return [...publicIds];
		},
		__awtsmoosDbFsRouter: {
			async maybe() {
				throw new Error("translation coverage must not call the private router");
			}
		}
	};
	return { input: { $_GET: {}, db }, calls };
}

/** Proves complete and guarded public series identities stay unchanged by coverage. */
async function run() {
	const legacy = Array.from({ length: 10 }, (_, index) => `post-${index + 1}`);
	const complete = Array.from({ length: 34 }, (_, index) => `post-${index + 1}`);
	const completeFixture = makeInput(complete);
	const upgraded = await originalPostIds({
		$i: completeFixture.input,
		heichelId: "ikar",
		seriesId: "seferHaSichos5747"
	});
	assert.strictEqual(upgraded.length, 34);
	assert.deepStrictEqual(upgraded, complete);
	assert.strictEqual(completeFixture.calls.publicKeys, 1);

	const guardedFixture = makeInput(legacy);
	const guarded = await originalPostIds({
		$i: guardedFixture.input,
		heichelId: "ikar",
		seriesId: "ordinarySeries"
	});
	assert.deepStrictEqual(guarded, legacy);
	assert.strictEqual(guardedFixture.calls.publicKeys, 1);
	console.log('B"H translationCoverage.test.js PASS');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
