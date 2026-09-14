//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module YiddishNativeImporter
 * @description
 * Streams transient Wiktextract records into resumable AwtsmoosDB authority.
 * Restarting keeps native progress unless --reset is explicit; the external
 * line protocol is decoded in memory and never becomes persistent JSONL data.
 */

import { SOURCES, sourceRoot } from './config.mjs';
import { normalizeKaikkiEntry } from './kaikki-entry.mjs';
import { sourceDatabasePath } from './source-database.mjs';
import {
	closeSourceWriter,
	finalizeSourceWriter,
	openSourceWriter,
	putSourceEntry,
	saveSourceState
} from './source-writer.mjs';
import { textLines } from './text-line-stream.mjs';

const DEFAULT_YIDDISH_SOURCE = 'https://kaikki.org/dictionary/Yiddish/kaikki.org-dictionary-Yiddish.jsonl';

/** Reads one scalar command-line option without another persistence layer. */
function value(name) {
	const index = process.argv.indexOf(name);
	return index >= 0 ? process.argv[index + 1] : '';
}

/** Resolves one lazily loaded native checkpoint into ordinary state. */
function resolved(value) {
	return value && typeof value.__resolve__ === 'function'
		? value.__resolve__()
		: value;
}

/** Records bounded progress while keeping the generation explicitly incomplete. */
async function checkpoint(database, processed, sourceId) {
	await saveSourceState(database, {
		complete: false,
		processed,
		lastSourceId: sourceId,
		updatedAt: new Date().toISOString()
	});
}

/** Restores durable progress and the upstream marker used to skip prior rows. */
function resumeState(database, reset) {
	const state = reset ? {} : resolved(database.root.importState) || {};
	return {
		processed: Math.max(0, Number(state.processed || 0)),
		marker: String(state.lastSourceId || ''),
		seeking: Boolean(!reset && state.lastSourceId)
	};
}
