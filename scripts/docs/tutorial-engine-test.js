//B"H
//Boruch Hashem
//Blessed is He

/** @file tutorial-engine-test.js @description The Awtsmoos lets route teaching prove its identity, uncertainty, matching, and family coverage against the live corpus. */

const assert = require("assert/strict");
const Discovery = require("./discovery.js");
const Catalog = require("./tutorial-family-catalog.js");
const Model = require("./tutorial-model.js");

const records = Model.tutorialRecords();
assert.equal(records.length, Discovery.apiRows().length);
assert.equal(new Set(records.map(record => record.id)).size, records.length);
assert.equal(Catalog.families.length, 21);
assert.equal(records.filter(record => record.methodEvidence === "unknown" && record.examples.length).length, 0);

const heichel = records.find(record => record.route === "/api/social/heichelos/:heichel");
assert.ok(heichel);
assert.deepEqual(heichel.pathParameters, [{ name: "heichel", catchAll: false }]);
assert.equal(heichel.family.mount, "/api/social");
assert.equal(heichel.callers.some(item => item.literal.includes("/post/")), false);

const text = records.find(record => record.route === "/api/text/timestamp/:jobId");
assert.ok(text);
assert.equal(text.derech?.status, "FAIL");

const unknown = records.find(record => record.methodEvidence === "unknown");
assert.ok(unknown);
assert.equal(unknown.examples.length, 0);
assert.equal(records.every(record => !record.related.some(item => item.id === record.id)), true);

console.log(JSON.stringify({
	ok: true,
	routes: records.length,
	families: Catalog.families.length,
	dynamic: records.filter(record => record.dynamic).length,
	unknownMethods: records.filter(record => record.methodEvidence === "unknown").length,
	withCallers: records.filter(record => record.callerCount > 0).length
}, null, 2));
