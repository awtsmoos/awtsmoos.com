// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

/**
 * B"H
 * The Awtsmoos leaves old vessels as history yet guards every living doorway.
 * Awtsmoos.com forbids Three.js where a public entrypoint can execute it,
 * while ordinary prose and archival experiments remain truthful witnesses.
 */

const GAMES_ROOT = path.resolve("geelooy/games");
const IGNORED_DIRECTORIES = new Set([
	"node_modules",
	".git",
	"ai_thoughts",
	"ai-thoughts",
	"tests",
	"docs"
]);
const SCRIPT_PATTERN = /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi;
const IMPORT_PATTERN = /(?:from\s*|import\s*\()\s*["']([^"']+)["']/g;
const FORBIDDEN_PATTERNS = [
	/\b(?:window|globalThis)\.THREE\b/,
	/\bTHREE\.[A-Za-z_$][\w$]*/,
	/(?:from\s*|import\s*\()\s*["']three(?:\/[^"']*)?["']/,
	/["'/(]three(?:\.module|\.min)?\.js\b/i,
	/adapters\/three\b/i,
	/examples\/jsm\b/i
];

test("public game entrypoints cannot reach Three.js", () => {
	const violations = publicEntrypoints()
		.flatMap(entrypoint => reachableThree(entrypoint));
	assert.deepEqual(violations, []);
});

/** Discover every directly addressable game HTML doorway. */
function publicEntrypoints(directory = GAMES_ROOT, output = []) {
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		if (entry.name.startsWith(".") || IGNORED_DIRECTORIES.has(entry.name)) continue;
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) publicEntrypoints(fullPath, output);
		else if (entry.name === "index.html") output.push(fullPath);
	}
	return output.sort();
}

/** Walk one public dependency graph and report reachable forbidden vessels. */
function reachableThree(entrypoint) {
	const pending = [entrypoint];
	const visited = new Set();
	const violations = [];
	while (pending.length) {
		const filePath = pending.pop();
		if (visited.has(filePath)) continue;
		visited.add(filePath);
		const source = fs.readFileSync(filePath, "utf8");
		if (containsForbiddenThree(source)) {
			violations.push(path.relative(GAMES_ROOT, filePath));
		}
		for (const specifier of dependencies(filePath, source)) {
			const dependency = resolveDependency(specifier, filePath);
			if (dependency && !visited.has(dependency)) pending.push(dependency);
		}
	}
	return violations;
}

/** Ignore commentary, then reject executable imports, globals, and vendor paths. */
function containsForbiddenThree(source) {
	const executable = source
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/(^|[^:])\/\/.*$/gm, "$1");
	return FORBIDDEN_PATTERNS.some(pattern => pattern.test(executable));
}

/** Extract static scripts and relative ESM dependencies from one vessel. */
function dependencies(filePath, source) {
	const specifiers = [];
	if (filePath.endsWith(".html")) {
		for (const match of source.matchAll(SCRIPT_PATTERN)) specifiers.push(match[1]);
	}
	for (const match of source.matchAll(IMPORT_PATTERN)) specifiers.push(match[1]);
	return specifiers;
}

/** Resolve repository-local browser imports without following network modules. */
function resolveDependency(rawSpecifier, importer) {
	const specifier = rawSpecifier.split(/[?#]/, 1)[0];
	if (/^(?:https?:|data:|blob:)/.test(specifier)) return null;
	let target;
	if (specifier.startsWith("/games/")) {
		target = path.join(GAMES_ROOT, specifier.slice("/games/".length));
	} else if (specifier.startsWith("/")) {
		return null;
	} else {
		target = path.resolve(path.dirname(importer), specifier);
	}
	for (const candidate of [target, `${target}.js`, `${target}.mjs`]) {
		if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
	}
	return null;
}
