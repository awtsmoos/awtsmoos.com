// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file analyze-core-failures.mjs
 * @description
 * The Awtsmoos gathers repeated browser failures into shared ownership families.
 * This Awtsmoos.com analyzer turns many route receipts into concise selectors,
 * samples, and stylesheet evidence before any production vessel is rewritten.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputRoot = path.dirname(toolsDirectory);
const resultsDirectory = path.join(outputRoot, "results");
const resultNames = (await fs.readdir(resultsDirectory)).filter(name => /^core-.*\.json$/.test(name) && name !== "core-route-matrix-summary.json");
const details = [];

function group(items, sampleFields) {
	const groups = new Map();
	for (const item of items) {
		const key = item.selector || "document";
		const current = groups.get(key) || { selector: key, count: 0, samples: [] };
		current.count += 1;
		const sample = Object.fromEntries(sampleFields.map(field => [field, item[field]]).filter(([, value]) => value !== undefined));
		if (current.samples.length < 3 && Object.keys(sample).length) {
			current.samples.push(sample);
		}
		groups.set(key, current);
	}
	return [...groups.values()].sort((first, second) => second.count - first.count);
}

for (const resultName of resultNames) {
	const evidence = JSON.parse(await fs.readFile(path.join(resultsDirectory, resultName), "utf8"));
	const probe = evidence.probe;
	details.push({
		resultName,
		requestedUrl: evidence.requestedUrl,
		finalUrl: probe.url,
		viewport: evidence.viewport,
		stylesheets: probe.stylesheets,
		overflow: group(probe.overflow, ["left", "right", "width"]),
		smallTargets: group(probe.smallTargets, ["width", "height", "text"]),
		unnamed: probe.unnamed,
		contrastFailures: group(probe.contrastFailures, ["ratio", "minimum", "text", "color", "background"]),
		consoleErrors: evidence.runtime.consoleErrors,
		exceptions: evidence.runtime.exceptions
	});
}

details.sort((first, second) => first.resultName.localeCompare(second.resultName));
const outputPath = path.join(resultsDirectory, "core-route-failure-details.json");
await fs.writeFile(outputPath, JSON.stringify(details, null, "\t"));
console.log(JSON.stringify({ routes: details.length, outputPath }, null, "\t"));
