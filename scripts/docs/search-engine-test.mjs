//B"H
//Boruch Hashem
//Blessed is He

/** @file search-engine-test.mjs @description The Awtsmoos lets search and Ask prove both conceptual human-first retrieval and exact project-path grounding against the real publication corpus. */

import fs from "node:fs";
import assert from "node:assert/strict";
import { questionPaths, questionTerms, retrieveRecords } from "../../geelooy/docs/modules/ask-retrieval.mjs";
import { parseQuery, searchDocuments } from "../../geelooy/docs/modules/search.mjs";

const root = "geelooy/docs/generated";
const manifest = JSON.parse(fs.readFileSync(`${root}/manifest.json`, "utf8"));
const records = manifest.searchIndexes.flatMap(relativePath => {
	return JSON.parse(fs.readFileSync(`${root}/${relativePath}`, "utf8"));
});

function includesPath(results, pattern) {
	return results.some(record => pattern.test(record.sourcePath));
}

assert.equal(records.length, manifest.documentCount, "manifest count must match search shards");
assert.equal(records.length > 600, true, "expected the full published documentation corpus");
assert.equal(parseQuery("category:API kind:generated tunnel").category, "api");

const mission = searchDocuments(records, "mission room admission", 15);
assert.equal(mission.length > 0, true, "mission room search should return results");
assert.equal(includesPath(mission, /MISSION_ROOMS|missionRooms|mission-room/i), true, "mission room docs should be discoverable");

const api = searchDocuments(records, "category:API tunnel", 30);
assert.equal(api.length > 0, true, "API filter should return results");
assert.equal(api.every(record => record.category === "API"), true, "API filter must be exact");

const generated = searchDocuments(records, "kind:generated route", 30);
assert.equal(generated.length > 0, true, "generated filter should return results");
assert.equal(generated.every(record => record.provenance === "generated"), true, "generated filter must be exact");

const architecture = searchDocuments(records, "architecture", 10);
assert.notEqual(architecture[0]?.provenance, "generated", "ordinary search should prefer human meaning when relevance is comparable");

const terms = questionTerms("How does Mission Room admission work?");
assert.equal(terms.includes("mission"), true);
assert.equal(terms.includes("room"), true);
assert.equal(terms.includes("admission"), true);

const ask = retrieveRecords(records, "How does Mission Room admission work?", 8);
assert.equal(includesPath(ask, /MISSION_ROOMS|missionRooms|mission-room/i), true, "Ask retrieval should find Mission Room evidence");
assert.equal(ask[0]?.provenance, "manual", "conceptual Ask should preserve human-first relevance");

const projectQuestion = "Explain the project geelooy/apps/code purpose entries dependencies";
assert.deepEqual(questionPaths(projectQuestion), ["geelooy/apps/code"]);
const projectAsk = retrieveRecords(records, projectQuestion, 8);
assert.equal(projectAsk.length > 0, true, "project-path Ask should return evidence");
assert.equal(
	projectAsk.slice(0, 3).some(record => /PROJECTS\/CODE\.md|geelooy-apps-code/i.test(record.sourcePath)),
	true,
	"exact project path should place Code evidence in the top three"
);
assert.equal(new Set(records.map(record => record.id)).size, records.length, "search IDs must be unique");

console.log(JSON.stringify({
	ok: true,
	documents: records.length,
	searchShards: manifest.searchIndexes.length,
	missionTop: mission.slice(0, 5).map(record => record.sourcePath),
	askTop: ask.slice(0, 5).map(record => record.sourcePath),
	projectAskTop: projectAsk.slice(0, 5).map(record => record.sourcePath)
}, null, 2));
