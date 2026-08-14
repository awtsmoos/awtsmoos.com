//B"H
//Boruch Hashem
//Blessed is He

/** @file system-model-test.js @description The Awtsmoos lets system teaching prove every curated manual/project/source/evidence edge before generated and public layers trust it. */

const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const Discovery = require("./discovery.js");
const Catalog = require("./system-catalog.js");
const Model = require("./system-model.js");

const records = Model.systemRecords();
assert.equal(records.length, Catalog.systems.length);
assert.equal(new Set(records.map(record => record.systemId)).size, records.length);
assert.equal(records.every(record => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.systemId)), true);
assert.deepEqual(new Set(records.map(record => record.district)), new Set(["data", "security", "realtime"]));

for (const record of records) {
	assert.ok(record.manuals.length, record.systemId);
	for (const file of [...record.manuals, ...record.sources, ...record.generatedEvidence]) {
		assert.ok(fs.existsSync(path.join(Discovery.root, file)), `${record.systemId}: ${file}`);
	}
	assert.equal(record.projects.length, Catalog.systems.find(item => item.id === record.systemId).projects.length, `${record.systemId}: project join`);
	for (const item of record.environmentEvidence) {
		assert.deepEqual(Object.keys(item).sort(), ["classification", "exampleSources", "name", "sources"]);
		assert.equal(typeof item.name, "string");
	}
}

const mission = records.find(record => record.systemId === "mission-room-admission");
assert.ok(mission.manuals.includes("docs/WEBSOCKETS/MISSION_ROOMS.md"));
assert.ok(mission.tags.includes("authorization"));
const routing = records.find(record => record.systemId === "realtime-application-routing");
assert.ok(routing.realtimeApplications.length >= 1);
assert.equal(JSON.stringify(records).includes('"secretValue"'), false);
assert.equal(JSON.stringify(records).includes('"value"'), false);

console.log(JSON.stringify({
	ok: true,
	systems: records.length,
	districts: Object.fromEntries(Catalog.districts.map(district => [district.id, records.filter(record => record.district === district.id).length])),
	environmentRows: records.reduce((sum, record) => sum + record.environmentEvidence.length, 0),
	realtimeApplications: routing.realtimeApplications.length,
	eventRows: records.reduce((sum, record) => sum + record.eventEvidence.length, 0)
}, null, 2));
