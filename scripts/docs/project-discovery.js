//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file project-discovery.js
 * @description
 * The Awtsmoos reveals many project vessels while Awtsmoos.com needs one stable atlas of their boundaries.
 * This module observes directory shape, entries, titles, symlinks, and documentation without inventing ownership from size alone.
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const Discovery = require("./discovery.js");
const Files = require("./file-classifier.js");

const supportRoots = ["ayzarim", "geelooy", "scripts", "tools", "tests", "templates", "ops", "awtsmoos.com", "ai_thoughts", "ai-thoughts"];

function childDirectories(relativeRoot) {
	const absolute = path.join(Discovery.root, relativeRoot);
	if (!fs.existsSync(absolute)) return [];
	return fs.readdirSync(absolute, { withFileTypes: true })
		.filter(entry => entry.isDirectory())
		.map(entry => `${relativeRoot}/${entry.name}`);
}

function candidateRoots() {
	const candidates = new Set(supportRoots.filter(root => fs.existsSync(path.join(Discovery.root, root))));
	for (const child of childDirectories("geelooy")) candidates.add(child);
	for (const family of ["geelooy/apps", "geelooy/api", "geelooy/games"]) {
		for (const child of childDirectories(family)) candidates.add(child);
	}
	for (const child of childDirectories("ayzarim")) candidates.add(child);
	return [...candidates].sort();
}

function projectType(relative, absolute) {
	if (fs.lstatSync(absolute).isSymbolicLink()) return "alias";
	if (/^(ai[-_]thoughts|geelooy\/\.awtsmoos-agent-thoughts)/.test(relative)) return "evidence";
	if (relative.startsWith("geelooy/api/")) return "api";
	if (relative.startsWith("geelooy/apps/")) return "app";
	if (relative.startsWith("geelooy/games/")) return "game";
	if (relative === "ayzarim/DosDB") return "data";
	if (relative === "ayzarim/awtsmoosDynamicServer") return "runtime";
	if (relative.startsWith("ayzarim/")) return "infrastructure";
	if (/^(tests|geelooy\/tests)$/.test(relative)) return "test";
	if (/^(ops)$/.test(relative)) return "operations";
	if (/^(scripts|tools|templates)$/.test(relative)) return "tooling";
	if (/^geelooy\/(libs|shared|scripts|style)$/.test(relative)) return "library";
	if (relative === "geelooy") return "public-root";
	if (relative === "ayzarim") return "runtime-root";
	if (fs.existsSync(path.join(absolute, "index.html"))) return "public";
	return "project";
}

function titleOf(absolute) {
	const index = path.join(absolute, "index.html");
	if (!fs.existsSync(index)) return "";
	const text = fs.readFileSync(index, "utf8");
	const match = text.match(/<title[^>]*>(.*?)<\/title>/is);
	return match ? match[1].replace(/\s+/g, " ").trim() : "";
}

function entryFiles(absolute) {
	const names = [
		"index.html", "index.js", "main.js", "app.js", "package.json",
		"_awtsmoos.derech.js", "DOCUMENTATION.md", "README.md", "readme.md"
	];
	return names.filter(name => fs.existsSync(path.join(absolute, name)));
}

function projectId(relative) {
	const slug = relative.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "project";
	const digest = crypto.createHash("sha256").update(relative).digest("hex").slice(0, 8);
	return `${slug}-${digest}`;
}

function projectRecord(relative) {
	const absolute = path.join(Discovery.root, relative);
	const counts = Files.summarizeDirectory(absolute);
	const stat = fs.lstatSync(absolute);
	const localDoc = fs.existsSync(path.join(absolute, "DOCUMENTATION.md"))
		? `${relative}/DOCUMENTATION.md`
		: "";
	return {
		id: projectId(relative),
		path: relative,
		type: projectType(relative, absolute),
		title: titleOf(absolute),
		entries: entryFiles(absolute),
		localDoc,
		symlinkTarget: stat.isSymbolicLink() ? fs.readlinkSync(absolute) : "",
		counts,
		total: Object.values(counts).reduce((sum, value) => sum + value, 0)
	};
}

function projectRecords() {
	return candidateRoots().map(projectRecord);
}

function projectRows() {
	return projectRecords().map(project => [
		project.path,
		project.type,
		project.total,
		project.counts.source,
		project.counts.tests,
		project.counts.assets,
		project.counts.generated,
		project.localDoc || "—",
		project.entries.join(", ") || "—",
		project.title || "—"
	]);
}

module.exports = { projectRecords, projectRows };
