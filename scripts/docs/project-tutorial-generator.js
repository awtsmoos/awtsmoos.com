//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file project-tutorial-generator.js
 * @description The Awtsmoos renews one bounded project tutorial for every discovered project boundary and keeps the index/type summaries generated from current source.
 */

const fs = require("fs");
const path = require("path");
const Discovery = require("./discovery.js");
const Render = require("./render.js");
const Model = require("./project-tutorial-model.js");
const TutorialRender = require("./project-tutorial-renderer.js");

const generated = path.join(Discovery.root, "docs", "GENERATED");
const projectRoot = path.join(generated, "PROJECT_TUTORIALS", "PROJECTS");

function indexRows(records) {
	return records.map(record => [
		`\`${record.path}\``,
		record.type,
		record.totalFiles,
		record.counts.tests,
		record.publicEntries.length,
		`[tutorial](../PROJECT_TUTORIALS/PROJECTS/${record.projectId}.md)`
	]);
}

function typeRows(records) {
	const byType = new Map();
	for (const record of records) {
		const value = byType.get(record.type) || { projects: 0, files: 0, tests: 0, public: 0 };
		value.projects += 1;
		value.files += record.totalFiles;
		value.tests += record.counts.tests;
		value.public += record.publicEntries.length;
		byType.set(record.type, value);
	}
	return [...byType].sort(([a], [b]) => a.localeCompare(b)).map(([type, value]) => [type, value.projects, value.files, value.tests, value.public]);
}

function writePages(records) {
	fs.rmSync(path.dirname(projectRoot), { recursive: true, force: true });
	fs.mkdirSync(projectRoot, { recursive: true });
	for (const record of records) {
		Render.writeFile(path.join(projectRoot, `${record.projectId}.md`), TutorialRender.routeBody(record));
	}
}

function generateProjectTutorialDocs(records = Model.projectTutorialRecords()) {
	writePages(records);
	const chunks = Render.writeTableChunks({
		directory: path.join(generated, "PROJECT_TUTORIAL_INDEX"),
		slug: "projects",
		title: "Project Tutorial Index",
		intro: "Every discovered project boundary linked to generated evidence teaching.",
		headers: ["Project", "Type", "Files", "Tests", "Public entries", "Tutorial"],
		rows: indexRows(records),
		chunkSize: 45
	});
	Render.writeIndex(generated + "/PROJECT_TUTORIAL_INDEX.md", "Project Tutorial Index", "Generated project teaching for every current boundary.", "PROJECT_TUTORIAL_INDEX", chunks);
	Render.writeFile(generated + "/PROJECT_TYPE_SUMMARY.md", `# Project Type Summary\n\n${Render.markdownTable(["Type", "Projects", "Files", "Tests", "Public entries"], typeRows(records))}`);
	return { projectTutorials: records.length, projectTutorialChunks: chunks.length };
}

module.exports = { generateProjectTutorialDocs };
