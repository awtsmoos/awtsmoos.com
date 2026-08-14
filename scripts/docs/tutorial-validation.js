//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file tutorial-validation.js
 * @description The Awtsmoos lets tutorial abundance remain accountable to current route source; Awtsmoos.com proves one unique generated teaching record per discovered route.
 */

const fs = require("fs");
const path = require("path");
const Discovery = require("./discovery.js");
const Catalog = require("./tutorial-family-catalog.js");
const Model = require("./tutorial-model.js");

function add(failures, kind, file, detail) {
	failures.push({ kind, file, detail });
}

function validateTutorials() {
	const failures = [];
	const records = Model.tutorialRecords();
	const expected = Discovery.apiRows();
	const ids = new Set(records.map(record => record.id));
	const keys = new Set(records.map(record => `${record.route}\0${record.source}`));
	if (records.length !== expected.length) add(failures, "tutorial_count", "tutorial model", `${records.length} != ${expected.length}`);
	if (ids.size !== records.length) add(failures, "tutorial_ids", "tutorial model", "duplicate tutorial IDs");
	if (keys.size !== records.length) add(failures, "tutorial_routes", "tutorial model", "duplicate route/source identity");
	for (const record of records) {
		if (!fs.existsSync(path.join(Discovery.root, record.source))) add(failures, "tutorial_source", record.source, "missing source");
		if (!fs.existsSync(path.join(Discovery.root, record.family.manual))) add(failures, "tutorial_manual", record.family.manual, record.route);
		if (!fs.existsSync(path.join(Discovery.root, record.tutorialFile))) add(failures, "tutorial_markdown", record.tutorialFile, record.route);
		if (record.methodEvidence === "unknown" && record.examples.length) add(failures, "tutorial_unknown_example", record.tutorialFile, record.route);
		if (record.related.some(item => item.id === record.id)) add(failures, "tutorial_self_related", record.tutorialFile, record.route);
	}
	const aiRoot = path.join(Discovery.root, "docs", "AI", "API_TUTORIALS");
	const manifestFile = path.join(aiRoot, "MANIFEST.json");
	if (!fs.existsSync(manifestFile)) add(failures, "tutorial_ai_manifest", "docs/AI/API_TUTORIALS/MANIFEST.json", "missing");
	else {
		const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
		if (manifest.routeCount !== records.length) add(failures, "tutorial_ai_count", "docs/AI/API_TUTORIALS/MANIFEST.json", `${manifest.routeCount} != ${records.length}`);
		if (manifest.familyCount !== Catalog.families.length) add(failures, "tutorial_family_count", "docs/AI/API_TUTORIALS/MANIFEST.json", `${manifest.familyCount} != ${Catalog.families.length}`);
	}
	return {
		failures,
		summary: {
			tutorialRoutes: records.length,
			tutorialFamilies: Catalog.families.length,
			tutorialDynamicRoutes: records.filter(record => record.dynamic).length,
			tutorialUnknownMethods: records.filter(record => record.methodEvidence === "unknown").length,
			tutorialRoutesWithCallers: records.filter(record => record.callerCount > 0).length
		}
	};
}

module.exports = { validateTutorials };
