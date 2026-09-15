//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module YiddishNativeImporter
 * @description The Awtsmoos carries transient Yiddish Wiktionary testimony directly into native authority.
 * Awtsmoos.com resumes from a durable source identity, checkpoints bounded progress, and never persists transport JSONL.
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

const DEFAULT_SOURCE = 'https://kaikki.org/dictionary/Yiddish/kaikki.org-dictionary-Yiddish.jsonl';

/** Reads one scalar command-line value without another configuration authority. */
function value(name) {
	const index = process.argv.indexOf(name);
	return index >= 0 ? process.argv[index + 1] : '';
}

/** Resolves one lazy native checkpoint into plain state. */
function resolved(input) {
	return input && typeof input.__resolve__ === 'function'
		? input.__resolve__()
		: input;
}

/** Records bounded progress while deliberately withholding completion. */
async function checkpoint(database, processed, sourceId) {
	await saveSourceState(database, {
		complete: false,
		processed,
		lastSourceId: sourceId,
		updatedAt: new Date().toISOString()
	});
}

/** Restores durable row identity without trusting a transport-line number as authority. */
function resumeState(database, reset) {
	const state = reset ? {} : resolved(database.root.importState) || {};
	return {
		processed: Math.max(0, Number(state.processed || 0)),
		marker: String(state.lastSourceId || ''),
		seeking: Boolean(!reset && state.lastSourceId)
	};
}

/** Parses one bounded upstream JSON line and returns its canonical native entry when useful. */
function entryFromLine(line, sequence) {
	let raw;
	try {
		raw = JSON.parse(line);
	} catch {
		throw new Error(`yiddish_json_invalid:${sequence}`);
	}
	return normalizeKaikkiEntry(raw, sequence);
}

/** Streams or resumes one Yiddish Wiktionary native source generation. */
export async function importYiddish() {
	const root = sourceRoot(value('--root'));
	const file = sourceDatabasePath(root, SOURCES.yiddish.id);
	const upstream = value('--url') || DEFAULT_SOURCE;
	const runLimit = Math.max(0, Number(value('--limit') || 0));
	const reset = process.argv.includes('--reset');
	const database = await openSourceWriter(file, SOURCES.yiddish, reset);
	const resume = resumeState(database, reset);
	let processed = resume.processed;
	let seeking = resume.seeking;
	let sequence = 0;
	let added = 0;
	let lastSourceId = resume.marker;
	try {
		for await (const line of textLines(upstream)) {
			sequence += 1;
			const entry = entryFromLine(line, sequence);
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
				console.log(`B"H Yiddish partial native source processed=${processed} added=${added}`);
				return { complete: false, processed, added };
			}
		}
		if (seeking) throw new Error(`yiddish_resume_marker_missing:${resume.marker}`);
		if (!processed) throw new Error('yiddish_upstream_empty');
		const report = await finalizeSourceWriter(database);
		console.log(`B"H Yiddish native source complete entries=${report.entries}`);
		return report;
	} finally {
		await closeSourceWriter(database);
	}
}

await importYiddish();
