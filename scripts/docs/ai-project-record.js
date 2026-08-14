//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ai-project-record.js
 * @description The Awtsmoos gives each project a bounded evidence packet linking human teaching, generated tutorial evidence, dependencies, entries, symbols, tests, and source.
 */

function humanDocumentation(record) {
	const documents = [record.localDoc, record.humanManual].filter(Boolean);
	if (record.path.startsWith("geelooy/api/")) documents.push("docs/API/README.md");
	if (record.path.startsWith("geelooy/apps/")) documents.push("docs/APPS/README.md");
	if (record.path.startsWith("geelooy/games/")) documents.push("docs/APPS/GAMES_AND_SIMULATION.md");
	if (record.path.startsWith("ayzarim/")) documents.push("docs/ARCHITECTURE.md");
	return [...new Set(documents)];
}

function createProjectRecord(record) {
	return {
		BH: "B\"H / Boruch Hashem / Blessed is He",
		schema: "awtsmoos-ai-project-v2",
		provenance: record.provenance,
		projectId: record.projectId,
		path: record.path,
		type: record.type,
		family: record.family,
		title: record.title,
		entries: record.entries,
		humanDocumentation: humanDocumentation(record),
		humanManual: record.humanManual,
		generatedTutorial: record.tutorialFile,
		symlinkTarget: record.symlinkTarget,
		counts: record.counts,
		totalFiles: record.totalFiles,
		symbolSummary: record.symbolSummary,
		outgoingDependencies: record.outgoing,
		incomingDependencies: record.incoming,
		externalDependencies: record.externalDependencies,
		publicEntries: record.publicEntries,
		requiresLocalDocumentation: record.requiresLocalDoc,
		documentationCovered: record.documentationCovered,
		navigationRule: "Human guide -> generated project tutorial -> dependency/entry evidence -> current source/tests/runtime."
	};
}

module.exports = { createProjectRecord, humanDocumentation };
