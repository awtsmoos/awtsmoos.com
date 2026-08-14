// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Policy = require("./sourceOnlyPolicy.js");
const Checker = require("./check-source-only.js");

/** @file Proves source-only policy catches payload without condemning handwritten build source. */
const entries = [
	{ path: "geelooy/app/source.js", bytes: 12000 },
	{ path: "geelooy/app/build/build-js.cjs", bytes: 3800 },
	{ path: "geelooy/app/hero.jpg", bytes: 100 },
	{ path: "geelooy/app/huge.js", bytes: 600000 },
	{ path: "geelooy/app/dist/generated.js", bytes: 1000 },
	{ path: "geelooy/app/.Awtsmoos/mission.json", bytes: 1000 },
	{ path: "geelooy/native/addon.node", bytes: 88000 }
];
const violations = Policy.violations(entries);
assert.equal(violations.length, 5);
assert.equal(Policy.classify(entries[1]).reasons.length, 0);
assert.deepEqual(violations[0].reasons, ["forbidden_extension:.jpg"]);
assert.match(violations[1].reasons.join(","), /blob_over_512k/);
assert.match(violations[2].reasons.join(","), /distribution_output_path/);
assert.match(violations[3].reasons.join(","), /runtime_or_generated_path/);
assert.match(violations[4].reasons.join(","), /forbidden_extension:.node/);
assert.deepEqual(Checker.parseLine("100644 blob abcdef0123 42\tgeelooy/source.js"), {
	bytes: 42,
	path: "geelooy/source.js"
});
console.log(JSON.stringify({ ok: true, suite: "source-only-policy", violations: violations.length }));
