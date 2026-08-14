//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file discovery-generator.js
 * @description
 * The Awtsmoos gathers project, symbol, dependency, public-entry, test, and documentation evidence into readable vessels.
 * Awtsmoos.com keeps exhaustive facts generated and bounded so human manuals remain clear while AI discovery gains a stable atlas.
 */

const path = require("path");
const Discovery = require("./discovery.js");
const Render = require("./render.js");
const Projects = require("./project-discovery.js");
const Symbols = require("./symbol-discovery.js");
const Dependencies = require("./dependency-discovery.js");
const Entries = require("./public-entry-discovery.js");
const Coverage = require("./documentation-coverage.js");

const generatedRoot = path.join(Discovery.root, "docs", "GENERATED");
const generatedPath = name => path.join(generatedRoot, name);

function chunkedTable(name, directory, slug, title, intro, headers, rows, size = 70) {
	const links = Render.writeTableChunks({
		directory: generatedPath(directory),
		slug,
		title,
		intro,
		headers,
		rows,
		chunkSize: size
	});
	Render.writeIndex(
		generatedPath(name),
		title,
		`${intro} **${rows.length} rows.**`,
		directory,
		links
	);
	return links.length;
}

function testOwnershipRows(projects) {
	return projects
		.filter(project => project.counts.tests > 0)
		.map(project => [
			project.path,
			project.type,
			project.counts.tests,
			project.localDoc || "—"
		])
		.sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0]));
}

function symlinkRows(projects) {
	return projects
		.filter(project => project.symlinkTarget)
		.map(project => [project.path, project.symlinkTarget, project.type]);
}

function generateDiscoveryDocs() {
	const projects = Projects.projectRecords();
	const projectRows = Projects.projectRows();
	const symbolRows = Symbols.symbolRows();
	const internalRows = Dependencies.internalDependencyRows();
	const externalRows = Dependencies.externalDependencyRows();
	const entryRows = Entries.entryRows();
	const coverageRows = Coverage.coverageRows();
	const missingRows = Coverage.missingDocumentationRows();
	const humanDocs = Coverage.humanDocumentationRows();
	const tests = testOwnershipRows(projects);
	let chunks = 0;
	chunks += chunkedTable("PROJECT_ATLAS.md", "PROJECT_ATLAS", "projects", "Generated Project Atlas", "Observed project/directory boundaries with classified file counts and local documentation status.", ["Path", "Type", "Files", "Source", "Tests", "Assets", "Generated", "Local docs", "Entries", "Title"], projectRows, 45);
	chunks += chunkedTable("PROJECT_SYMBOL_SUMMARY.md", "PROJECT_SYMBOLS", "symbols", "Generated Project Symbol Summary", "Lexical JavaScript-family symbol evidence grouped by project; sample names aid discovery without replacing source inspection.", ["Project", "Source files", "Classes", "Named functions", "Exports", "Sample names"], symbolRows, 55);
	chunks += chunkedTable("PROJECT_DEPENDENCIES.md", "PROJECT_DEPENDENCIES", "dependencies", "Generated Cross-Project Dependency Evidence", "Relative-import edges between observed project boundaries; counts are lexical references, not runtime reachability.", ["Source project", "Target project", "References", "Example sources"], internalRows, 65);
	chunks += chunkedTable("EXTERNAL_DEPENDENCIES.md", "EXTERNAL_DEPENDENCIES", "external-dependencies", "Generated External Dependency Evidence", "Package-import evidence grouped by project; provider/runtime meaning remains source-specific.", ["Project", "Dependency", "References", "Example sources"], externalRows, 65);
	chunks += chunkedTable("PUBLIC_ENTRY_POINTS.md", "PUBLIC_ENTRY_POINTS", "public-entry-points", "Generated Public Entry Point Atlas", "Every discovered `index.html` beneath the Geelooy public root, with title and linked script/style evidence.", ["URL", "Entry file", "Title", "Scripts", "Script sample", "Styles", "Style sample"], entryRows, 45);
	chunks += chunkedTable("DOCUMENTATION_COVERAGE.md", "DOCUMENTATION_COVERAGE", "documentation-coverage", "Generated Documentation Coverage", "Observed project boundaries and whether a local human breadcrumb is required and present.", ["Project", "Type", "Files", "Requires local docs", "Covered", "Local docs"], coverageRows, 60);
	chunks += chunkedTable("HUMAN_DOCUMENTATION_INDEX.md", "HUMAN_DOCUMENTATION", "human-docs", "Generated Human Documentation Index", "Manual Markdown pages outside the generated tree, with title, line count, and relative-link count.", ["Document", "Title", "Lines", "Links"], humanDocs, 70);
	Render.writeFile(generatedPath("MISSING_DOCUMENTATION.md"), `# Generated Missing Documentation\n\n${Render.markdownTable(["Project", "Type", "Files", "Title", "Entries"], missingRows)}`);
	Render.writeFile(generatedPath("TEST_OWNERSHIP.md"), `# Generated Test Ownership\n\n${Render.markdownTable(["Project", "Type", "Test files", "Local docs"], tests)}`);
	Render.writeFile(generatedPath("SYMLINKS.md"), `# Generated Symlink / Alias Inventory\n\n${Render.markdownTable(["Path", "Target", "Type"], symlinkRows(projects))}`);
	return {
		projects: projects.length,
		symbolProjects: symbolRows.length,
		internalDependencyEdges: internalRows.length,
		externalDependencyEdges: externalRows.length,
		publicEntries: entryRows.length,
		documentationGaps: missingRows.length,
		humanDocs: humanDocs.length,
		testProjects: tests.length,
		discoveryEntryPoints: 10,
		discoveryChunks: chunks
	};
}

module.exports = { generateDiscoveryDocs };
