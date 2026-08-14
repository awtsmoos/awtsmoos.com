//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file publication-generator.js
 * @description The Awtsmoos lets documents, project evidence, route teaching, and Data/Security/Realtime systems enter one transport-bounded public reflection.
 */

const crypto = require("crypto");
const path = require("path");
const Discovery = require("./discovery.js");
const Scope = require("./publication-scope.js");
const Records = require("./publication-record.js");
const Projects = require("./publication-projects.js");
const Systems = require("./system-publication.js");
const Tutorials = require("./publication-tutorials.js");
const Output = require("./publication-output.js");
const Pages = require("./publication-page-output.js");

const outputRoot = path.join(Discovery.root, "geelooy", "docs", "generated");

function versionOf(searchRecords) {
	const hash = crypto.createHash("sha256");
	for (const record of searchRecords) {
		hash.update(record.sourcePath);
		hash.update("\0");
		hash.update(record.searchText);
		hash.update("\0");
	}
	return hash.digest("hex").slice(0, 16);
}

function categoryRecords(searchRecords) {
	const categories = new Map();
	for (const record of searchRecords) {
		const category = categories.get(record.category) || { name: record.category, count: 0, manual: 0, generated: 0 };
		category.count += 1;
		if (["manual", "breadcrumb", "project"].includes(record.provenance)) category.manual += 1;
		if (record.provenance === "generated") category.generated += 1;
		categories.set(record.category, category);
	}
	return [...categories.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function curatedIds(sourceToId) {
	const sources = [
		"docs/README.md", "docs/LEARN/README.md", "docs/START_HERE.md", "docs/ARCHITECTURE.md",
		"docs/API/README.md", "docs/PROJECTS/README.md", "docs/TUTORIALS/SYSTEMS/README.md",
		"docs/SECURITY/README.md", "docs/DATA/README.md", "docs/WEBSOCKETS/README.md",
		"docs/DEVELOPMENT/README.md", "docs/AI/README.md"
	];
	return sources.map(sourcePath => sourceToId.get(sourcePath)).filter(Boolean);
}

function publicationManifest(searchRecords, projects, systems, categories, sourceToId, version, tutorials) {
	return {
		BH: "B\"H / Boruch Hashem / Blessed is He",
		schema: "awtsmoos-public-docs-v6",
		version,
		documentCount: searchRecords.length,
		projectCount: projects.length,
		systemCount: systems.length,
		categoryCount: categories.length,
		curatedDocumentIds: curatedIds(sourceToId),
		searchIndexes: Output.writeArrayShards(outputRoot, "search", "search", searchRecords),
		projectIndexes: Output.writeArrayShards(outputRoot, "projects", "projects", projects, 18000),
		systemIndexes: Output.writeArrayShards(outputRoot, "systems", "systems", systems, 18000),
		categories: Output.writeJson(outputRoot, "categories.json", categories),
		pagesRoot: "pages/",
		contentRoot: "content/",
		projectTutorialIndex: "docs/GENERATED/PROJECT_TUTORIAL_INDEX.md",
		projectHumanGuide: "docs/TUTORIALS/PROJECTS/README.md",
		systemTutorialIndex: "docs/GENERATED/SYSTEM_TUTORIAL_INDEX.md",
		systemHumanGuide: "docs/TUTORIALS/SYSTEMS/README.md",
		...tutorials,
		ask: { capabilityEndpoint: "/api/gpt/capability", chatEndpoint: "/api/gpt/chat", mode: "page-authorized-fallback" }
	};
}

function generatePublicationDocs(projectRecords = null, systemRecords = null) {
	const records = Scope.publicationFiles().map(Records.publicationRecord);
	const searchRecords = records.map(record => record.search);
	const sourceToId = new Map(searchRecords.map(record => [record.sourcePath, record.id]));
	const projects = Projects.publicProjects(sourceToId, projectRecords);
	const systems = Systems.publicSystems(systemRecords);
	const categories = categoryRecords(searchRecords);
	const version = versionOf(searchRecords);
	Output.resetOutput(outputRoot);
	const contentShards = Pages.writePageRecords(outputRoot, records);
	const tutorials = Tutorials.writePublicTutorials(outputRoot);
	const manifest = publicationManifest(searchRecords, projects, systems, categories, sourceToId, version, tutorials);
	Output.writeJson(outputRoot, "manifest.json", manifest);
	return {
		publicationDocuments: searchRecords.length,
		publicationProjects: projects.length,
		publicationSystems: systems.length,
		publicationCategories: categories.length,
		publicationSearchShards: manifest.searchIndexes.length,
		publicationProjectShards: manifest.projectIndexes.length,
		publicationSystemShards: manifest.systemIndexes.length,
		publicationContentShards: contentShards,
		publicationTutorials: manifest.tutorialCount,
		publicationTutorialShards: manifest.tutorialIndexes.length,
		publicationVersion: version
	};
}

module.exports = { generatePublicationDocs };
