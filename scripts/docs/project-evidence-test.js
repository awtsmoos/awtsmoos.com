//B"H
//Boruch Hashem
//Blessed is He

/** @file project-evidence-test.js @description The Awtsmoos lets project ownership and evidence joins prove representative boundaries before generated teaching trusts them. */

const assert = require("assert/strict");
const Projects = require("./project-discovery.js");
const Evidence = require("./project-evidence.js");
const Model = require("./project-tutorial-model.js");

const projects = Projects.projectRecords();
assert.equal(Evidence.ownerForFile("geelooy/apps/code/index.html", projects), "geelooy/apps/code");
assert.equal(Evidence.ownerForFile("geelooy/api/social/helper/index.js", projects), "geelooy/api/social");
assert.equal(Evidence.ownerForFile("ayzarim/awtsmoosDynamicServer/server/initDb.js", projects), "ayzarim/awtsmoosDynamicServer");

const records = Model.projectTutorialRecords();
assert.equal(records.length, projects.length);
assert.equal(new Set(records.map(record => record.projectId)).size, records.length);
for (const path of ["geelooy/api/social", "geelooy/apps/code", "geelooy/games/mitzvahWorld", "ayzarim/awtsmoosDynamicServer"]) {
	assert.ok(records.find(record => record.path === path), path);
}
assert.ok(records.some(record => record.outgoing.length));
assert.ok(records.some(record => record.incoming.length));
assert.ok(records.some(record => record.externalDependencies.length));
assert.ok(records.some(record => record.publicEntries.length));

console.log(JSON.stringify({
	ok: true,
	projects: records.length,
	withOutgoing: records.filter(record => record.outgoing.length).length,
	withIncoming: records.filter(record => record.incoming.length).length,
	withExternal: records.filter(record => record.externalDependencies.length).length,
	withPublicEntries: records.filter(record => record.publicEntries.length).length
}, null, 2));
