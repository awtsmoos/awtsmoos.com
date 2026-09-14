//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module JastrowNativeImporter
 * @description
 * Jastrow is crawled from transient Sefaria API evidence directly into one
 * resumable AwtsmoosDB source. Native import state survives interruption while
 * linked-headword loops, missing records, and incomplete runs never earn publication.
 */

import { SOURCES, sourceRoot } from './config.mjs';
import { jastrowBounds, jastrowLinkedEntries, upstreamDelay } from './jastrow-client.mjs';
import { normalizeJastrowEntry } from './jastrow-entry.mjs';
import { jastrowRows, nextJastrowHeadword } from './jastrow-traversal.mjs';
import { sourceDatabasePath } from './source-database.mjs';
import {
	closeSourceWriter,
	finalizeSourceWriter,
	openSourceWriter,
	putSourceEntry,
	saveSourceState
} from './source-writer.mjs';

/** Reads one command-line value without introducing a second configuration layer. */
function value(name) {
	const index = process.argv.indexOf(name);
	return index >= 0 ? process.argv[index + 1] : '';
}

/** Resolves a lazily loaded AwtsmoosDB value into ordinary import state. */
function resolved(value) {
	return value && typeof value.__resolve__ === 'function'
		? value.__resolve__()
		: value;
}

/** Filters one mixed Lexicon API response into valid Jastrow native records. */
function nativeEntries(entries) {
	return jastrowRows(entries)
		.map(normalizeJastrowEntry)
		.filter(entry => entry?.rid);
}

/** Imports one linked headword and returns the authoritative next link. */
async function importHeadword(database, headword) {
	const upstream = await jastrowLinkedEntries(headword);
	const entries = nativeEntries(upstream);
	if (!entries.length) throw new Error(`jastrow_entries_missing:${headword}`);
	for (const entry of entries) {
		await putSourceEntry(database, entry, entry.rid);
	}
	return {
		nextHeadword: nextJastrowHeadword(upstream, headword),
		written: entries.length
	};
}

/** Crawls until the linked source reaches its declared last headword or a test limit. */
async function importJastrow() {
	const root = sourceRoot(value('--root'));
	const file = sourceDatabasePath(root, SOURCES.jastrow.id);
	const reset = process.argv.includes('--reset');
	const delayMs = Math.max(80, Number(value('--delay-ms') || 220));
	const runLimit = Math.max(0, Number(value('--limit') || 0));
	const database = await openSourceWriter(file, SOURCES.jastrow, reset);
	try {
		const bounds = await jastrowBounds();
		const state = resolved(database.root.importState) || {};
		let current = !reset && state.currentHeadword
			? String(state.currentHeadword)
			: bounds.firstWord;
		let processed = Number(state.processed || 0);
		let runCount = 0;
		const visited = new Set();
		while (current) {
			if (visited.has(current)) throw new Error(`jastrow_link_cycle:${current}`);
			visited.add(current);
			const result = await importHeadword(database, current);
			processed += 1;
			runCount += 1;
			const finished = current === bounds.lastWord || !result.nextHeadword;
			await saveSourceState(database, {
				currentHeadword: finished ? '' : result.nextHeadword,
				lastHeadword: current,
				processed,
				updatedAt: new Date().toISOString()
			});
			if (finished) {
				const report = await finalizeSourceWriter(database);
				console.log(`B"H Jastrow native source complete entries=${report.entries}`);
				return report;
			}
			if (runLimit && runCount >= runLimit) {
				console.log(`B"H Jastrow partial checkpoint processed=${processed}`);
				return { complete: false, processed };
			}
			current = result.nextHeadword;
			await upstreamDelay(delayMs);
		}
		throw new Error('jastrow_link_chain_ended_without_completion');
	} finally {
		await closeSourceWriter(database);
	}
}

await importJastrow();
