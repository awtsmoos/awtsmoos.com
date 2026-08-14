//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file tutorial-generator.js
 * @description The Awtsmoos renews every discovered API route into human-readable generated teaching and machine-readable discovery without replacing hand-written meaning.
 */

const fs = require("fs");
const path = require("path");
const Discovery = require("./discovery.js");
const Render = require("./render.js");
const Catalog = require("./tutorial-family-catalog.js");
const Model = require("./tutorial-model.js");
const TutorialRender = require("./tutorial-renderer.js");
const TutorialAi = require("./tutorial-ai.js");

const generated = path.join(Discovery.root, "docs", "GENERATED");
const routeDirectory = path.join(generated, "API_TUTORIALS", "ROUTES");

function routeIndexRows(records) {
	return records.map(record => [
		`\`${record.route}\``,
		record.family.title,
		record.methodEvidence,
		record.derech?.status || "unknown",
		`[tutorial](../API_TUTORIALS/ROUTES/${record.id}.md)`,
		`\`${record.source}\``
	]);
}

function familyRows(records) {
	return Catalog.families.map(family => {
		const routes = records.filter(record => record.family.mount === family.mount);
		const dynamic = routes.filter(record => record.dynamic).length;
		const health = routes[0]?.derech?.status || "no extracted rows";
		const manual = `../TUTORIALS/API/${family.manual.split("/").pop()}`;
		return [
			`\`${family.mount}\``,
			family.title,
			routes.length,
			dynamic,
			health,
			`[human tutorial](${manual})`
		];
	});
}

function writeRouteTutorials(records) {
	fs.rmSync(path.dirname(routeDirectory), { recursive: true, force: true });
	fs.mkdirSync(routeDirectory, { recursive: true });
	for (const record of records) {
		Render.writeFile(
			path.join(routeDirectory, `${record.id}.md`),
			TutorialRender.routeBody(record)
		);
	}
}

function writeIndexes(records) {
	const chunks = Render.writeTableChunks({
		directory: path.join(generated, "API_TUTORIAL_INDEX"),
		slug: "routes",
		title: "API Tutorial Routes",
		intro: "Each row links one discovered API route to generated teaching. Method/contract fields remain evidence, not invented schemas.",
		headers: ["Route", "Family", "Method evidence", "Health", "Tutorial", "Source"],
		rows: routeIndexRows(records),
		chunkSize: 45
	});
	Render.writeIndex(
		path.join(generated, "API_TUTORIAL_INDEX.md"),
		"API Tutorial Index",
		"Every currently discovered API route receives a tutorial record and bounded generated page.",
		"API_TUTORIAL_INDEX",
		chunks
	);
	Render.writeFile(
		path.join(generated, "API_FAMILY_TUTORIALS.md"),
		`# API Family Tutorials\n\n${Render.markdownTable(["Mount", "Family", "Routes", "Dynamic", "Derech health", "Manual"], familyRows(records))}`
	);
	return chunks.length;
}

function generateTutorialDocs() {
	const records = Model.tutorialRecords();
	writeRouteTutorials(records);
	const chunks = writeIndexes(records);
	const ai = TutorialAi.writeTutorialAi(records, Catalog.families);
	return {
		tutorialRoutes: records.length,
		tutorialFamilies: Catalog.families.length,
		tutorialDynamicRoutes: ai.dynamic,
		tutorialUnknownMethods: ai.unknown,
		tutorialIndexChunks: chunks,
		tutorialAiChunks: ai.chunks
	};
}

module.exports = { generateTutorialDocs };
