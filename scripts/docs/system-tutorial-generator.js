//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file system-tutorial-generator.js
 * @description The Awtsmoos renews one generated tutorial for every curated Data, Security, and Realtime system while keeping indexes bounded.
 */

const fs = require("fs");
const path = require("path");
const Discovery = require("./discovery.js");
const Render = require("./render.js");
const Catalog = require("./system-catalog.js");
const Renderer = require("./system-tutorial-renderer.js");

const generated = path.join(Discovery.root, "docs", "GENERATED");
const tutorialRoot = path.join(generated, "SYSTEM_TUTORIALS", "SYSTEMS");

function indexRows(records) {
	return records.map(record => [
		record.title,
		record.district,
		record.projects.length,
		record.environmentEvidence.length,
		record.realtimeApplications.length,
		record.eventEvidence.length,
		`[tutorial](../SYSTEM_TUTORIALS/SYSTEMS/${record.systemId}.md)`
	]);
}

function districtRows(records) {
	return Catalog.districts.map(district => {
		const systems = records.filter(record => record.district === district.id);
		return [
			district.title,
			systems.length,
			systems.reduce((sum, record) => sum + record.environmentEvidence.length, 0),
			systems.reduce((sum, record) => sum + record.realtimeApplications.length, 0),
			systems.reduce((sum, record) => sum + record.eventEvidence.length, 0)
		];
	});
}

function writePages(records) {
	fs.rmSync(path.dirname(tutorialRoot), { recursive: true, force: true });
	fs.mkdirSync(tutorialRoot, { recursive: true });
	for (const record of records) {
		Render.writeFile(path.join(tutorialRoot, `${record.systemId}.md`), Renderer.tutorialBody(record));
	}
}

function generateSystemTutorialDocs(records) {
	writePages(records);
	const chunks = Render.writeTableChunks({
		directory: path.join(generated, "SYSTEM_TUTORIAL_INDEX"),
		slug: "systems",
		title: "System Tutorial Index",
		intro: "Curated system meaning joined to bounded current source evidence.",
		headers: ["System", "District", "Projects", "Env names", "Apps", "Events", "Tutorial"],
		rows: indexRows(records),
		chunkSize: 40
	});
	Render.writeIndex(generated + "/SYSTEM_TUTORIAL_INDEX.md", "System Tutorial Index", "Data, Security, and Realtime system teaching.", "SYSTEM_TUTORIAL_INDEX", chunks);
	Render.writeFile(generated + "/SYSTEM_DISTRICT_SUMMARY.md", `# System District Summary\n\n${Render.markdownTable(["District", "Systems", "Env names", "Apps", "Events"], districtRows(records))}`);
	return { systemTutorials: records.length, systemTutorialChunks: chunks.length };
}

module.exports = { generateSystemTutorialDocs };
