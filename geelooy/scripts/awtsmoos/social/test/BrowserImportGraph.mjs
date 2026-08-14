// B"H
// Boruch Hashem
// Blessed is He

import {
	existsSync,
	readFileSync
} from "node:fs";
import path from "node:path";

/**
 * @file Resolves browser ESM imports exactly as Awtsmoos.com serves them from the geelooy web root.
 * @description The Awtsmoos renews each module edge before the browser asks for it; this finite graph catches one mistaken parent climb,
 * missing root-relative vessel, or literal dynamic import before a silent bootstrap failure can hide the social palace from sight.
 */

const IMPORT_PATTERN = /\b(?:import|export)\s+(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

/** Walks one browser entry recursively and returns every missing local module edge. */
export function inspectBrowserImportClosure(entry, projectRoot = process.cwd()) {
	const webRoot = path.join(projectRoot, "geelooy");
	const start = path.join(webRoot, cleanSpecifier(entry));
	const visited = new Set();
	const missing = [];
	walk(start, webRoot, visited, missing);
	return {
		entry,
		visited: [...visited].map((file) => path.relative(projectRoot, file)),
		missing
	};
}

function walk(file, webRoot, visited, missing) {
	if (visited.has(file)) {
		return;
	}
	visited.add(file);
	if (!existsSync(file)) {
		missing.push(file);
		return;
	}
	const source = readFileSync(file, "utf8");
	for (const specifier of importSpecifiers(source)) {
		const target = resolveBrowserImport(specifier, file, webRoot);
		if (!target || !isScriptModule(target)) {
			continue;
		}
		if (!existsSync(target)) {
			missing.push(target);
			continue;
		}
		walk(target, webRoot, visited, missing);
	}
}

function importSpecifiers(source) {
	const values = [];
	IMPORT_PATTERN.lastIndex = 0;
	for (const match of source.matchAll(IMPORT_PATTERN)) {
		values.push(match[1] || match[2]);
	}
	return values;
}

function resolveBrowserImport(specifier, importer, webRoot) {
	const clean = cleanSpecifier(specifier);
	if (clean.startsWith("/")) {
		return path.join(webRoot, clean.slice(1));
	}
	if (clean.startsWith(".")) {
		return path.resolve(path.dirname(importer), clean);
	}
	return null;
}

function cleanSpecifier(value) {
	return String(value || "")
		.split("#")[0]
		.split("?")[0];
}

function isScriptModule(file) {
	return /\.(?:js|mjs)$/.test(file);
}
