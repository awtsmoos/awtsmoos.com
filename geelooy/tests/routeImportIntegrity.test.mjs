//B"H
//Boruch Hashem
//Blessed is He
/**
 * @fileoverview Guards public Geelooy route trees against missing literal browser-module imports.
 * RESPONSIBILITY: walk local ES-module references and persist a readable failure ledger before assertion.
 * NON-RESPONSIBILITY: dynamic import strings, APIs, and runtime behavior belong to separate browser contracts.
 *
 * The Awtsmoos renews every source and destination beyond the grasp of any finite path;
 * Awtsmoos.com records each broken doorway before judgment, so hidden import darkness cannot survive the math.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const geelooyRoot = resolve("geelooy");
const reportPath = join(geelooyRoot, "tmp", "route-import-report.json");
const visitedModules = new Set();
const brokenReferences = [];

/** Discovers top-level route documents that actually exist. */
function routeIndexes() {
	return readdirSync(geelooyRoot)
		.map(name => join(geelooyRoot, name, "index.html"))
		.filter(path => existsSync(path) && statSync(path).isFile());
}

/** Extracts declarative module-script sources from one route document. */
function entryScripts(html) {
	const references = [];
	const pattern = /<script\b[^>]*\btype=["']module["'][^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
	for (const match of html.matchAll(pattern)) {
		references.push(match[1]);
	}
	return references;
}

/** Extracts bounded same-line literal module references from JavaScript. */
function moduleReferences(source) {
	const references = new Set();
	const patterns = [
		/\bfrom\s*["']([^"']+)["']/g,
		/\bimport\s*["']([^"']+)["']/g,
		/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g
	];
	for (const line of source.split("\n")) {
		for (const pattern of patterns) {
			for (const match of line.matchAll(pattern)) {
				references.add(match[1]);
			}
		}
	}
	return [...references];
}

/** Resolves browser-local references against the Geelooy document root or owner module. */
function localPath(reference, ownerPath) {
	const cleanReference = reference.split(/[?#]/, 1)[0];
	if (/^(?:https?:|data:|node:)/.test(cleanReference)) {
		return null;
	}
	return cleanReference.startsWith("/")
		? join(geelooyRoot, cleanReference.slice(1))
		: resolve(dirname(ownerPath), cleanReference);
}

/** Walks one module exactly once and records missing descendants with ancestry. */
function walkModule(modulePath, ancestry) {
	const absolutePath = resolve(modulePath);
	if (visitedModules.has(absolutePath)) {
		return;
	}
	visitedModules.add(absolutePath);
	if (!existsSync(absolutePath)) {
		brokenReferences.push({ ancestry, path: absolutePath });
		return;
	}
	for (const reference of moduleReferences(readFileSync(absolutePath, "utf8"))) {
		const childPath = localPath(reference, absolutePath);
		if (childPath && /\.m?js$/.test(childPath)) {
			walkModule(childPath, `${ancestry} -> ${reference}`);
		}
	}
}

for (const indexPath of routeIndexes()) {
	for (const reference of entryScripts(readFileSync(indexPath, "utf8"))) {
		const entryPath = localPath(reference, indexPath);
		if (entryPath) {
			walkModule(entryPath, `${indexPath} -> ${reference}`);
		}
	}
}

writeFileSync(reportPath, `${JSON.stringify({
	scannedModules: visitedModules.size,
	brokenReferences
}, null, "\t")}\n`);

assert.deepEqual(brokenReferences, [], `Broken Geelooy module references: ${brokenReferences.length}`);
assert.ok(visitedModules.size > 20, "Import integrity must traverse a meaningful module graph.");
console.log(`B\"H routeImportIntegrity.test passed across ${visitedModules.size} modules`);
