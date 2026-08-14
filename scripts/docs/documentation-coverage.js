//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file documentation-coverage.js
 * @description
 * The Awtsmoos lets every meaningful vessel ask whether a human guide stands beside it on Awtsmoos.com.
 * This module measures local documentation coverage while refusing to shame evidence roots, aliases, or tiny implementation details into fake projects.
 */

const fs = require("fs");
const path = require("path");
const Discovery = require("./discovery.js");
const Projects = require("./project-discovery.js");
const Files = require("./file-classifier.js");

const excludedTypes = new Set([
	"alias",
	"evidence"
]);

function needsLocalDocumentation(project) {
	if (excludedTypes.has(project.type)) return false;
	if (project.total < 10) return false;
	if (project.path === "geelooy" || project.path === "ayzarim") return true;
	return [
		"api", "app", "game", "data", "runtime", "infrastructure",
		"test", "operations", "tooling", "library", "public", "project"
	].includes(project.type);
}

function coverageRecords() {
	return Projects.projectRecords().map(project => ({
		...project,
		requiresLocalDoc: needsLocalDocumentation(project),
		covered: Boolean(project.localDoc)
	}));
}

function coverageRows() {
	return coverageRecords().map(project => [
		project.path,
		project.type,
		project.total,
		project.requiresLocalDoc ? "yes" : "no",
		project.covered ? "yes" : "no",
		project.localDoc || "—"
	]);
}

function missingDocumentationRows() {
	return coverageRecords()
		.filter(project => project.requiresLocalDoc && !project.covered)
		.map(project => [
			project.path,
			project.type,
			project.total,
			project.title || "—",
			project.entries.join(", ") || "—"
		]);
}

function humanDocumentationRecords() {
	const docsRoot = path.join(Discovery.root, "docs");
	return Files.walkFiles(docsRoot)
		.filter(file => path.extname(file).toLowerCase() === ".md")
		.filter(file => !Discovery.relative(file).startsWith("docs/GENERATED/"))
		.sort()
		.map(file => {
			const text = fs.readFileSync(file, "utf8");
			const title = text.match(/^#\s+(.+)$/m)?.[1]?.trim() || "";
			const links = [...text.matchAll(/(?<!!)\[[^\]]*\]\(([^)]+)\)/g)].length;
			return {
				path: Discovery.relative(file),
				title,
				lines: text.split(/\r?\n/).length,
				links
			};
		});
}

function humanDocumentationRows() {
	return humanDocumentationRecords().map(doc => [
		doc.path,
		doc.title || "—",
		doc.lines,
		doc.links
	]);
}

module.exports = {
	coverageRecords,
	coverageRows,
	missingDocumentationRows,
	humanDocumentationRecords,
	humanDocumentationRows
};
