//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file system-ai-generator.js
 * @description The Awtsmoos lets AI readers enter stable system meaning through bounded packets that never contain environment values or secret material.
 */

const fs = require("fs");
const path = require("path");
const Discovery = require("./discovery.js");
const Catalog = require("./system-catalog.js");

const root = path.join(Discovery.root, "docs", "AI", "SYSTEMS");
const recordsRoot = path.join(root, "RECORDS");

function writeJson(file, value) {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, `${JSON.stringify(value, null, "\t")}\n`);
}

function aiRecord(record) {
	return {
		BH: "B\"H / Boruch Hashem / Blessed is He",
		schema: "awtsmoos-ai-system-v1",
		...record,
		navigationRule: "Human manual -> generated system tutorial/evidence -> related project/source -> tests/runtime verification."
	};
}

function writeIndexes(files) {
	const chunks = [];
	for (let index = 0; index < files.length; index += 40) {
		const relative = `INDEX/systems-${String(chunks.length + 1).padStart(3, "0")}.json`;
		writeJson(path.join(root, relative), {
			BH: "B\"H / Boruch Hashem / Blessed is He",
			provenance: "generated-system-file-index",
			systems: files.slice(index, index + 40)
		});
		chunks.push(relative);
	}
	return chunks;
}

function generateSystemAi(records) {
	fs.rmSync(root, { recursive: true, force: true });
	fs.mkdirSync(recordsRoot, { recursive: true });
	const files = records.map(record => {
		const relative = `RECORDS/${record.systemId}.json`;
		writeJson(path.join(root, relative), aiRecord(record));
		return relative;
	});
	const indexes = writeIndexes(files);
	writeJson(path.join(root, "MANIFEST.json"), {
		BH: "B\"H / Boruch Hashem / Blessed is He",
		schema: "awtsmoos-ai-systems-v1",
		provenance: "curated-semantics-plus-generated-local-source-evidence",
		systemCount: records.length,
		districts: Catalog.districts,
		indexShards: indexes,
		humanStart: "docs/TUTORIALS/SYSTEMS/README.md",
		generatedIndex: "docs/GENERATED/SYSTEM_TUTORIAL_INDEX.md",
		publicExplorer: "/docs/?view=systems"
	});
	return { aiSystems: records.length, aiSystemIndexShards: indexes.length };
}

module.exports = { generateSystemAi };
