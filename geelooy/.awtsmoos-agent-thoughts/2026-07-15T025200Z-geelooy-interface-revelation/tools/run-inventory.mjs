// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file run-inventory.mjs
 * @description
 * The Awtsmoos gathers every visible entry and imported garment into one
 * durable Awtsmoos.com map, so ownership can be repaired without guessing.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildCssGraph, resolveHtmlStylesheet } from "./css-graph.mjs";
import { walkFiles } from "./file-walk.mjs";
import { inspectHtml } from "./html-inventory.mjs";

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputRoot = path.dirname(toolsDirectory);
const repositoryRoot = path.resolve(outputRoot, "../../..");
const geelooyRoot = path.join(repositoryRoot, "geelooy");
const htmlFiles = await walkFiles(geelooyRoot, filePath => filePath.endsWith(".html"));
const scriptFiles = await walkFiles(geelooyRoot, filePath => /\.(?:js|mjs)$/.test(filePath));
const entries = [];
const brokenStyles = [];
const importedOwners = new Map();

for (const htmlFile of htmlFiles) {
	const entry = await inspectHtml(htmlFile, geelooyRoot);
	entry.styleGraphs = [];
	for (const href of entry.stylesheets) {
		const entryStyle = resolveHtmlStylesheet(href, htmlFile, geelooyRoot);
		if (!entryStyle) {
			continue;
		}
		const graph = await buildCssGraph(entryStyle, geelooyRoot);
		entry.styleGraphs.push({
			entry: relative(graph.entry),
			files: graph.files.map(relative),
			broken: graph.broken.map(relative)
		});
		brokenStyles.push(...graph.broken);
		for (const file of graph.files) {
			const owners = importedOwners.get(file) || [];
			owners.push(entry.route);
			importedOwners.set(file, owners);
		}
	}
	entries.push(entry);
}

const injections = [];
for (const scriptFile of scriptFiles) {
	const source = await fs.readFile(scriptFile, "utf8");
	const patterns = [
		/createElement\(["']style["']\)/,
		/createElement\(["']link["']\)/,
		/insertRule\(/,
		/adoptedStyleSheets/,
		/style\.textContent\s*=/,
		/insertAdjacentHTML\([^\n]*<style/i
	];
	if (patterns.some(pattern => pattern.test(source))) {
		injections.push(relative(scriptFile));
	}
}

function relative(filePath) {
	return path.relative(repositoryRoot, filePath).replace(/\\/g, "/");
}

const result = {
	generatedAt: new Date().toISOString(),
	counts: {
		htmlEntries: entries.length,
		uniqueImportedStyles: importedOwners.size,
		brokenStyles: new Set(brokenStyles).size,
		dynamicStyleScripts: injections.length
	},
	entries,
	brokenStyles: [...new Set(brokenStyles)].map(relative),
	dynamicStyleScripts: injections,
	sharedStyles: [...importedOwners.entries()]
		.filter(([, owners]) => new Set(owners).size > 1)
		.map(([file, owners]) => ({
			file: relative(file),
			routes: [...new Set(owners)].sort()
		}))
};

await fs.mkdir(path.join(outputRoot, "results"), { recursive: true });
await fs.writeFile(path.join(outputRoot, "results", "route-style-inventory.json"), JSON.stringify(result, null, "\t"));
console.log(JSON.stringify(result.counts, null, "\t"));
