//B"H
//Boruch Hashem
//Blessed is He

/** @file documentation-validation.js @description The Awtsmoos lets the original Markdown, AI, generator, coverage, link, and derech covenant remain independently testable. */

const fs = require("fs");
const path = require("path");
const Utils = require("./validation-utils.js");
const Coverage = require("./documentation-coverage.js");
const Contracts = require("./api-contract-discovery.js");

function validateDocumentation() {
	const failures = [];
	let linksChecked = 0;
	let maxMarkdownLines = 0;
	let maxMarkdownFile = "";
	const markdownFiles = Utils.documentationFiles();
	for (const file of markdownFiles) {
		const text = fs.readFileSync(file, "utf8");
		const lines = text.split(/\r?\n/);
		if (lines.length > maxMarkdownLines) {
			maxMarkdownLines = lines.length;
			maxMarkdownFile = Utils.relative(file);
		}
		if (lines.slice(0, 3).join("\n") !== Utils.blessing.join("\n")) failures.push({ kind: "markdown_header", file: Utils.relative(file), detail: "missing canonical blessing header" });
		if (lines.length > 120) failures.push({ kind: "markdown_lines", file: Utils.relative(file), detail: lines.length });
		for (const link of Utils.localMarkdownLinks(file, text)) {
			linksChecked += 1;
			if (!Utils.hasPath(link.absolute)) failures.push({ kind: "broken_link", file: Utils.relative(file), detail: link.target });
		}
	}
	const generatorFiles = Utils.generatorFiles();
	for (const file of generatorFiles) {
		const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).length;
		if (lines > 120) failures.push({ kind: "generator_lines", file: Utils.relative(file), detail: lines });
		const checked = Utils.syntaxCheck(file);
		if (checked.status !== 0) failures.push({ kind: "generator_syntax", file: Utils.relative(file), detail: checked.stderr.trim() });
	}
	const aiJsonFiles = Utils.aiJsonFiles();
	for (const file of aiJsonFiles) {
		try {
			JSON.parse(fs.readFileSync(file, "utf8"));
		} catch (error) {
			failures.push({ kind: "invalid_json", file: Utils.relative(file), detail: error.message });
		}
	}
	const manifest = JSON.parse(fs.readFileSync(path.join(Utils.root, "docs", "AI", "MANIFEST.json"), "utf8"));
	const projectDirectory = path.join(Utils.root, "docs", "AI", "PROJECTS");
	const projectFiles = fs.readdirSync(projectDirectory).filter(name => name.endsWith(".json"));
	if (manifest.projectCount !== projectFiles.length) failures.push({ kind: "manifest_project_count", file: "docs/AI/MANIFEST.json", detail: `${manifest.projectCount} != ${projectFiles.length}` });
	if (manifest.missingLocalDocumentationCount !== 0) failures.push({ kind: "manifest_missing_docs", file: "docs/AI/MANIFEST.json", detail: manifest.missingLocalDocumentationCount });
	for (const name of projectFiles) {
		const record = JSON.parse(fs.readFileSync(path.join(projectDirectory, name), "utf8"));
		if (!record.path || !Utils.hasPath(path.join(Utils.root, record.path))) failures.push({ kind: "project_path", file: `docs/AI/PROJECTS/${name}`, detail: record.path || "missing path" });
	}
	const documentationGaps = Coverage.missingDocumentationRows();
	if (documentationGaps.length) failures.push({ kind: "documentation_gaps", file: "docs/GENERATED/MISSING_DOCUMENTATION.md", detail: documentationGaps.length });
	const knownTextDerech = "geelooy/api/text/_awtsmoos.derech.js";
	const derechRows = Contracts.derechHealthRows();
	for (const row of derechRows.filter(item => item[1] !== "OK" && item[0] !== knownTextDerech)) failures.push({ kind: "derech_syntax", file: row[0], detail: row[2] });
	return {
		failures,
		summary: {
			markdownFiles: markdownFiles.length,
			maxMarkdownLines,
			maxMarkdownFile,
			generatorFiles: generatorFiles.length,
			aiJsonFiles: aiJsonFiles.length,
			projectRecords: projectFiles.length,
			documentationGaps: documentationGaps.length,
			linksChecked,
			derechOk: derechRows.filter(row => row[1] === "OK").length,
			knownDerechFailures: derechRows.filter(row => row[1] !== "OK" && row[0] === knownTextDerech).map(row => row[0])
		}
	};
}

module.exports = { validateDocumentation };
