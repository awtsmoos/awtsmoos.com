//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file system-validation.js
 * @description The Awtsmoos lets curated systems answer to generated tutorials, AI packets, public shards, declared source/manual targets, and a strict no-secret-value field covenant.
 */

const fs = require("fs");
const path = require("path");
const Catalog = require("./system-catalog.js");
const Utils = require("./validation-utils.js");

const forbiddenKeys = new Set(["value", "secretValue", "environmentValue"]);
const allowedEnvironmentKeys = ["classification", "exampleSources", "name", "sources"];

function add(failures, kind, file, detail) {
	failures.push({ kind, file, detail });
}

function readJson(file, failures, kind) {
	try {
		return JSON.parse(fs.readFileSync(file, "utf8"));
	} catch (error) {
		add(failures, kind, Utils.relative(file), error.message);
		return null;
	}
}

function forbiddenField(value, trail = "root") {
	if (!value || typeof value !== "object") return null;
	for (const [key, child] of Object.entries(value)) {
		if (forbiddenKeys.has(key)) return `${trail}.${key}`;
		const nested = forbiddenField(child, `${trail}.${key}`);
		if (nested) return nested;
	}
	return null;
}

function aiSystems(failures) {
	const root = path.join(Utils.root, "docs", "AI", "SYSTEMS", "RECORDS");
	if (!fs.existsSync(root)) return [];
	return fs.readdirSync(root).filter(name => name.endsWith(".json")).sort().flatMap(name => {
		const record = readJson(path.join(root, name), failures, "system_ai_json");
		return record ? [record] : [];
	});
}

function publicSystems(failures) {
	const root = path.join(Utils.root, "geelooy", "docs", "generated");
	const manifest = readJson(path.join(root, "manifest.json"), failures, "system_public_manifest");
	if (!manifest) return [];
	return (manifest.systemIndexes || []).flatMap(relative => {
		const records = readJson(path.join(root, relative), failures, "system_public_json");
		return Array.isArray(records) ? records : [];
	});
}

function compareIds(failures, label, expected, actual) {
	const missing = [...expected].filter(id => !actual.has(id));
	const extra = [...actual].filter(id => !expected.has(id));
	if (missing.length || extra.length) add(failures, "system_id_mismatch", label, `missing=${missing.join(",")} extra=${extra.join(",")}`);
}

function validateRecord(record, failures) {
	for (const file of [...record.manuals, ...record.sources, ...record.generatedEvidence, record.tutorialFile]) {
		if (file && !fs.existsSync(path.join(Utils.root, file))) add(failures, "system_target_missing", file, record.systemId);
	}
	for (const item of record.environmentEvidence || []) {
		if (JSON.stringify(Object.keys(item).sort()) !== JSON.stringify(allowedEnvironmentKeys)) add(failures, "system_environment_shape", record.systemId, Object.keys(item).join(","));
	}
	const forbidden = forbiddenField(record);
	if (forbidden) add(failures, "system_forbidden_field", record.systemId, forbidden);
}

function validateSystems() {
	const failures = [];
	const expected = new Set(Catalog.systems.map(system => system.id));
	const tutorialRoot = path.join(Utils.root, "docs", "GENERATED", "SYSTEM_TUTORIALS", "SYSTEMS");
	const tutorials = new Set(fs.readdirSync(tutorialRoot).filter(name => name.endsWith(".md")).map(name => name.replace(/\.md$/, "")));
	const ai = aiSystems(failures);
	const published = publicSystems(failures);
	compareIds(failures, "system tutorials", expected, tutorials);
	compareIds(failures, "AI systems", expected, new Set(ai.map(record => record.systemId)));
	compareIds(failures, "public systems", expected, new Set(published.map(record => record.systemId)));
	for (const record of ai) validateRecord(record, failures);
	for (const record of published) validateRecord(record, failures);
	return {
		failures,
		summary: {
			currentSystems: expected.size,
			systemTutorials: tutorials.size,
			systemAiRecords: ai.length,
			publicSystemRecords: published.length
		}
	};
}

module.exports = { validateSystems };
