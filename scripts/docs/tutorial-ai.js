//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file tutorial-ai.js
 * @description The Awtsmoos gives agents bounded route records and index shards so concept discovery can lead to human teaching, evidence, source, callers, and tests.
 */

const fs = require("fs");
const path = require("path");
const Discovery = require("./discovery.js");

const aiRoot = path.join(Discovery.root, "docs", "AI", "API_TUTORIALS");
const routeRoot = path.join(aiRoot, "ROUTES");

function writeJson(file, value) {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, `${JSON.stringify(value, null, "\t")}\n`);
}

function reset() {
	fs.rmSync(aiRoot, { recursive: true, force: true });
	fs.mkdirSync(routeRoot, { recursive: true });
}

function indexChunks(records, chunkSize = 55) {
	const chunks = [];
	for (let index = 0; index < records.length; index += chunkSize) {
		const name = `routes-${String(chunks.length + 1).padStart(3, "0")}.json`;
		const routes = records.slice(index, index + chunkSize).map(record => ({
			id: record.id,
			route: record.route,
			family: record.family.mount,
			source: record.source,
			manual: record.family.manual,
			record: `ROUTES/${record.id}.json`,
			tutorial: record.tutorialFile
		}));
		writeJson(path.join(aiRoot, name), { BH: "B\"H", routes });
		chunks.push(name);
	}
	return chunks;
}

function writeTutorialAi(records, families) {
	reset();
	for (const record of records) writeJson(path.join(routeRoot, `${record.id}.json`), record);
	const chunks = indexChunks(records);
	const unknown = records.filter(record => record.methodEvidence === "unknown").length;
	const dynamic = records.filter(record => record.dynamic).length;
	writeJson(path.join(aiRoot, "MANIFEST.json"), {
		BH: "B\"H / Boruch Hashem / Blessed is He",
		schema: "awtsmoos-api-tutorial-discovery-v1",
		routeCount: records.length,
		familyCount: families.length,
		dynamicRouteCount: dynamic,
		unknownMethodCount: unknown,
		routeIndexChunks: chunks,
		routeRecordsRoot: "ROUTES/",
		manualCurriculumRoot: "docs/LEARN",
		generatedTutorialIndex: "docs/GENERATED/API_TUTORIAL_INDEX.md",
		navigationRule: "Begin with a human tutorial, use generated route evidence, then inspect current source/callers/tests before asserting behavior."
	});
	return { chunks: chunks.length, unknown, dynamic };
}

module.exports = { writeTutorialAi };
