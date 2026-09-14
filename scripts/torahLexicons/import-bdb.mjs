//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BdbNativeImporter
 * @description
 * Streams BDB XML directly into resumable AwtsmoosDB authority. Restarting
 * keeps verified native progress unless --reset is explicit; upstream bytes
 * remain transient and never become an XML, JSON, JSONL, CSV, or manifest DB.
 */

import { SOURCES, sourceRoot } from './config.mjs';
import { normalizeBdbEntry } from './bdb-entry.mjs';
import { sourceDatabasePath } from './source-database.mjs';
import {
	closeSourceWriter,
	finalizeSourceWriter,
	openSourceWriter,
	putSourceEntry,
	saveSourceState
} from './source-writer.mjs';
import { xmlEntries } from './xml-entry-stream.mjs';

const DEFAULT_BDB_XML = 'https://raw.githubusercontent.com/openscriptures/HebrewLexicon/master/BrownDriverBriggs.xml';

/** Reads one scalar command-line option without a second configuration authority. */
function value(name) {
	const index = process.argv.indexOf(name);
	return index >= 0 ? process.argv[index + 1] : '';
}

/** Resolves one lazy native state value without retaining a storage proxy. */
function resolved(value) {
	return value && typeof value.__resolve__ === 'function'
		? value.__resolve__()
		: value;
}

/** Persists bounded progress without claiming source completeness. */
async function checkpoint(database, processed, sourceId) {
	await saveSourceState(database, {
		complete: false,
		processed,
		lastSourceId: sourceId,
		updatedAt: new Date().toISOString()
	});
}

/** Tracks restart position while the upstream stream advances to the last durable row. */
function resumeState(database, reset) {
	const state = reset ? {} : resolved(database.root.importState) || {};
	return {
		processed: Math.max(0, Number(state.processed || 0)),
		marker: String(state.lastSourceId || ''),
		seeking: Boolean(!reset && state.lastSourceId)
	};
}

/** Streams or resumes one BDB native source generation. */
async function importBdb() {
	const root = sourceRoot(value('--root'));
	const file = sourceDatabasePath(root, SOURCES.bdb.id);
	const upstream = value('--url') || DEFAULT_BDB_XML;
	const runLimit = Math.max(0, Number(value('--limit') || 0));
	const reset = process.argv.includes('--reset');
	const database = await openSourceWriter(file, SOURCES.bdb, reset);
	const resume = resumeState(database, reset);
	let processed = resume.processed;
	let seeking = resume.seeking;
	let added = 0;
	let lastSourceId = resume.marker;
	try {
		for await (const fragment of xmlEntries(upstream)) {
			const entry = normalizeBdbEntry(fragment);
			if (!entry) continue;
			if (seeking) {
				if (entry.sourceId === resume.marker) seeking = false;
				continue;
			}
			await putSourceEntry(database, entry, entry.sourceId);
			processed += 1;
			added += 1;
			lastSourceId = entry.sourceId;
			if (added % 250 === 0) await checkpoint(database, processed, lastSourceId);
			if (runLimit && added >= runLimit) {
				await checkpoint(database, processed, lastSourceId);
				console.log(`B"H BDB partial native source processed=${processed} added=${added}`);
				return { complete: false, processed, added };
			}
		}
		if (seeking) throw new Error(`bdb_resume_marker_missing:${resume.marker}`);
		if (!processed) throw new Error('bdb_upstream_empty');
		const report = await finalizeSourceWriter(database);
		console.log(`B"H BDB native source complete entries=${report.entries}`);
		return report;
	} finally {
		await closeSourceWriter(database);
	}
}

await importBdb();
