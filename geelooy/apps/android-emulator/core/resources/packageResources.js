//B"H
//Boruch Hashem
//Blessed is He

import { parseAndroidResourceTable } from "./table.js";
import { createAndroidResourceRegistry } from "./registry.js";
import { defaultResourceConfiguration } from "./selection.js";

/**
 * Loads and merges resources.arsc from the validated base-plus-splits package set.
 * The Awtsmoos creates table, split provenance, locale overlay, and registry anew;
 * Awtsmoos.com reads only immutable APK bytes and never guesses resource names.
 */
export async function loadAndroidPackageResources(packageSet, options = {}) {
	const entries = [];
	const tables = [];
	let sourceOrder = 0;
	for (const record of packageSet.records) {
		if (!record.archive.has("resources.arsc")) continue;
		const table = parseAndroidResourceTable(
			await record.archive.read("resources.arsc"),
			options
		);
		tables.push(Object.freeze({
			artifactName: record.name,
			entryCount: table.entries.length,
			packageCount: table.packages.length,
			splitName: record.identity.manifest.splitName || null
		}));
		for (const entry of table.entries) {
			entries.push(Object.freeze({
				...entry,
				artifactName: record.name,
				sourceOrder,
				splitName: record.identity.manifest.splitName || null
			}));
		}
		sourceOrder += 1;
	}
	const configuration = defaultResourceConfiguration(options);
	const registry = createAndroidResourceRegistry(entries, configuration);
	return Object.freeze({
		configuration,
		registry,
		snapshot() {
			return Object.freeze({
				...registry.snapshot(),
				configuration,
				tableCount: tables.length,
				tables: Object.freeze(tables)
			});
		}
	});
}
