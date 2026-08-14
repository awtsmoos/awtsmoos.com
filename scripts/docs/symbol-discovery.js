//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file symbol-discovery.js
 * @description
 * The Awtsmoos lets names emerge from source while Awtsmoos.com keeps the names tied to their project vessels.
 * This lexical summary counts classes, named functions, and export patterns, then preserves small representative samples for AI discovery.
 */

const fs = require("fs");
const path = require("path");
const Discovery = require("./discovery.js");
const Files = require("./file-classifier.js");

const javascriptExtensions = new Set([".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx"]);

function projectOwner(file) {
	const relative = Discovery.relative(file);
	const parts = relative.split("/");
	if (parts[0] === "geelooy" && ["apps", "api", "games"].includes(parts[1]) && parts[2]) {
		return parts.slice(0, 3).join("/");
	}
	if (parts[0] === "geelooy" && parts[1]) return parts.slice(0, 2).join("/");
	if (parts[0] === "ayzarim" && parts[1]) return parts.slice(0, 2).join("/");
	return parts[0] || ".";
}

function productionSource(file) {
	if (!javascriptExtensions.has(path.extname(file).toLowerCase())) return false;
	const kind = Files.classifyFile(file);
	return kind === "source";
}

function namesFrom(text, pattern) {
	const names = [];
	for (const match of text.matchAll(pattern)) {
		const name = match[1];
		if (name && !names.includes(name)) names.push(name);
	}
	return names;
}

function exportNames(text) {
	const names = new Set();
	for (const match of text.matchAll(/exports\.([A-Za-z_$][\w$]*)\s*=/g)) names.add(match[1]);
	for (const match of text.matchAll(/export\s+(?:default\s+)?(?:class|function|const|let|var)?\s*([A-Za-z_$][\w$]*)/g)) names.add(match[1]);
	for (const match of text.matchAll(/module\.exports\s*=\s*\{([^}]*)\}/gs)) {
		for (const piece of match[1].split(",")) {
			const name = piece.trim().split(/\s*:\s*/)[0];
			if (/^[A-Za-z_$][\w$]*$/.test(name)) names.add(name);
		}
	}
	return [...names];
}

function symbolSummaries() {
	const projects = new Map();
	for (const base of [Discovery.geelooy, path.join(Discovery.root, "ayzarim")]) {
		for (const file of Files.walkFiles(base).filter(productionSource)) {
			const text = fs.readFileSync(file, "utf8");
			const owner = projectOwner(file);
			if (!projects.has(owner)) {
				projects.set(owner, {
					files: 0,
					classes: 0,
					functions: 0,
					exports: 0,
					samples: []
				});
			}
			const project = projects.get(owner);
			const classes = namesFrom(text, /\bclass\s+([A-Za-z_$][\w$]*)/g);
			const functions = namesFrom(text, /\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g);
			const exports = exportNames(text);
			project.files += 1;
			project.classes += classes.length;
			project.functions += functions.length;
			project.exports += exports.length;
			for (const name of [...exports, ...classes, ...functions]) {
				if (project.samples.length >= 12) break;
				if (!project.samples.includes(name)) project.samples.push(name);
			}
		}
	}
	return [...projects.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function symbolRows() {
	return symbolSummaries().map(([project, summary]) => [
		project,
		summary.files,
		summary.classes,
		summary.functions,
		summary.exports,
		summary.samples.join(", ") || "—"
	]);
}

module.exports = { symbolSummaries, symbolRows };
