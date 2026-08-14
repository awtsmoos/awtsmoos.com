//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file publication-tutorial-validation.js
 * @description The Awtsmoos lets browser route teaching answer to the same bounded source identities as canonical tutorial generation.
 */

const fs = require("fs");
const path = require("path");
const Utils = require("./validation-utils.js");
const Model = require("./tutorial-model.js");

const maximumBytes = 22500;

function readBounded(root, relative, failures) {
	const file = path.join(root, relative);
	if (!fs.existsSync(file)) {
		failures.push({ kind: "public_tutorial_missing", file: relative, detail: "missing" });
		return null;
	}
	const bytes = fs.statSync(file).size;
	if (bytes > maximumBytes) failures.push({ kind: "public_tutorial_bytes", file: relative, detail: bytes });
	try {
		return JSON.parse(fs.readFileSync(file, "utf8"));
	} catch (error) {
		failures.push({ kind: "public_tutorial_json", file: relative, detail: error.message });
		return null;
	}
}

function validatePublicTutorials() {
	const failures = [];
	const root = path.join(Utils.root, "geelooy", "docs", "generated");
	const manifest = readBounded(root, "manifest.json", failures);
	if (!manifest) return { failures, summary: {} };
	const records = (manifest.tutorialIndexes || []).flatMap(relative => {
		const values = readBounded(root, relative, failures);
		return Array.isArray(values) ? values : [];
	});
	const families = readBounded(root, manifest.tutorialFamilies, failures) || [];
	const expected = Model.tutorialRecords();
	const ids = new Set(records.map(record => record.id));
	if (manifest.tutorialCount !== records.length) failures.push({ kind: "public_tutorial_count", file: "manifest.json", detail: `${manifest.tutorialCount} != ${records.length}` });
	if (records.length !== expected.length) failures.push({ kind: "public_tutorial_source_count", file: "tutorials", detail: `${records.length} != ${expected.length}` });
	if (ids.size !== records.length) failures.push({ kind: "public_tutorial_ids", file: "tutorials", detail: "duplicate IDs" });
	if (families.length !== 21) failures.push({ kind: "public_tutorial_families", file: manifest.tutorialFamilies, detail: families.length });
	for (const record of records) {
		if (!fs.existsSync(path.join(Utils.root, record.source))) failures.push({ kind: "public_tutorial_source", file: record.source, detail: record.route });
		if (record.methodEvidence === "unknown" && record.examples?.length) failures.push({ kind: "public_tutorial_unknown_example", file: record.id, detail: record.route });
	}
	return {
		failures,
		summary: {
			publicTutorialRoutes: records.length,
			publicTutorialFamilies: families.length,
			publicTutorialShards: manifest.tutorialIndexes?.length || 0
		}
	};
}

module.exports = { validatePublicTutorials };
