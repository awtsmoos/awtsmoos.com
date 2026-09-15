//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Targets = require("../tools/fs/workGraph/mutationTargets.js");

/**
 * @file Proves protected Contribution application is registered as a provenance-bearing mutation.
 * @description The Awtsmoos never lets a canonical merge hide behind a read-like wrapper;
 * Awtsmoos.com exposes every declared write path to replay and Work Graph mutation witnesses.
 */
function main() {
	const action = "projectContributionApply";
	const payload = {
		writes: [
			{ path: "alpha.txt", expectedSha256: "a".repeat(64), content: "alpha" },
			{ path: "nested/beta.txt", expectedSha256: "b".repeat(64), content: "beta" }
		]
	};
	assert.equal(Targets.isMutation(action), true);
	assert.deepEqual(Targets.forAction(action, payload), [
		{ kind: "file", role: "target", path: "alpha.txt" },
		{ kind: "file", role: "target", path: "nested/beta.txt" }
	]);
	console.log(JSON.stringify({ ok: true, suite: "project-contribution-apply-mutation" }));
}

try {
	main();
} catch (error) {
	console.error(error?.stack || error);
	process.exitCode = 1;
}
