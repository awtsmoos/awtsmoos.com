//B"H
//Blessed is He
//Boruch Hashem

/** @module NotesStore
 * Publish-notes storage (Worker H, 2026-10-21, user order ~19:51 EDT):
 * agent-authored work-order notes attached to posts / series / heichelos
 * so other agents can find and work them later.
 *
 * Storage design (chosen to fit this codebase's own patterns):
 *   - Source of truth: ONE JSON FILE PER NOTE at
 *       <dbRoot>/socialPacked/publish-notes/notes/<noteId>.json
 *     — the same per-record-file convention as jobState.js
 *     (<dbRoot>/socialPacked/post-import-jobs/<jobId>.json). A create is
 *     O(1): write tmp file + rename (atomic, crash-safe). It NEVER
 *     rewrites a giant shared file, so appends stay cheap at 20k+ notes.
 *   - noteId = 'note_' + <createdAtMs base36> + '_' + <6 random bytes hex>,
 *     so lexicographic filename order IS chronological order: the global
 *     feed walks the directory newest-first without loading anything.
 *   - Per-target index: append-only JSONL under
 *       <dbRoot>/socialPacked/publish-notes/by-target/<hash>.jsonl
 *     one {"id","createdAt"} line per note, appended (appendFileSync) at
 *     create time. <hash> = first 32 hex of sha256 over the target key
 *     (heichelId + seriesId + postId) — Hebrew/unicode ids stay safe as
 *     filenames and collisions are practically impossible. The index is
 *     DERIVED data only: rebuildIndexes() regenerates every index file
 *     from the note files, and per-target reads skip ids whose note file
 *     is gone, so a stale index can never invent a note.
 *   - Feed reads stream: directory ids sorted desc, ONE note file loaded
 *     at a time, filters applied on the fly, page returned as soon as it
 *     fills; a scan budget (candidates / wall-clock) guarantees a partial
 *     page + nextCursor instead of an unbounded scan. Memory is O(page).
 *
 * dbRoot resolution mirrors jobState.js exactly:
 *   $i.db.directory || $i.db.root || $AWTSMOOS_DBROOT || default volume.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function notesRoot($i) {
	const dir = $i?.db?.directory || $i?.db?.root || process.env.AWTSMOOS_DBROOT || '/mnt/HC_Volume_102267213/dayuhChadash';
	return path.join(dir, 'socialPacked', 'publish-notes');
}

function notesDir($i) { return path.join(notesRoot($i), 'notes'); }
function indexDir($i) { return path.join(notesRoot($i), 'by-target'); }

function targetKeyOf(target) {
	return String(target.heichelId || '') + '\n' + String(target.seriesId || '') + '\n' + String(target.postId || '');
}

function indexFileFor($i, target) {
	const h = crypto.createHash('sha256').update(targetKeyOf(target), 'utf8').digest('hex').slice(0, 32);
	return path.join(indexDir($i), h + '.jsonl');
}

function newNoteId(now) {
	return 'note_' + now.toString(36) + '_' + crypto.randomBytes(6).toString('hex');
}

/** Atomic single-note write: tmp file in the same dir + rename. */
function writeNoteFile($i, note) {
	const dir = notesDir($i);
	fs.mkdirSync(dir, { recursive: true });
	const tmp = path.join(dir, note.id + '.json.tmp-' + process.pid + '-' + crypto.randomBytes(3).toString('hex'));
	fs.writeFileSync(tmp, JSON.stringify(note));
	fs.renameSync(tmp, path.join(dir, note.id + '.json'));
}

function readNoteFile($i, id) {
	try {
		return JSON.parse(fs.readFileSync(path.join(notesDir($i), id + '.json'), 'utf8'));
	} catch (_) { return null; }
}

/** Append one id line to the note's per-target index (cheap, crash-safe:
 *  a torn last line is skipped by readers and fixed by a rebuild). */
function appendTargetIndex($i, note) {
	try {
		const dir = indexDir($i);
		fs.mkdirSync(dir, { recursive: true });
		fs.appendFileSync(indexFileFor($i, note.target), JSON.stringify({ id: note.id, createdAt: note.createdAt }) + '\n');
	} catch (_) { /* index is derived: a missed append is healed by rebuild */ }
}

/** Create + persist a note (file first, then index append). */
function createNote($i, note) {
	writeNoteFile($i, note);
	appendTargetIndex($i, note);
	return note;
}

/** All note ids, newest first (filename order = chronological order). */
function listNoteIdsDesc($i) {
	try {
		return fs.readdirSync(notesDir($i))
			.filter(f => f.startsWith('note_') && f.endsWith('.json'))
			.map(f => f.slice(0, -5))
			.sort()
			.reverse();
	} catch (_) { return []; }
}

/** Ids for one target from its index, newest first. Stale ids (note file
 *  gone) are filtered by the caller when it loads each note. */
function listTargetIdsDesc($i, target) {
	try {
		const raw = fs.readFileSync(indexFileFor($i, target), 'utf8');
		const ids = [];
		for (const line of raw.split('\n')) {
			if (!line.trim()) continue;
			try { const row = JSON.parse(line); if (row && row.id) ids.push(row.id); } catch (_) { /* torn line */ }
		}
		return ids.reverse();
	} catch (_) { return []; }
}

/** Regenerate every per-target index from the note files (source of
 *  truth). Bounded memory: one note at a time; index lines are collected
 *  per target file and appended in small batches. */
function rebuildIndexes($i) {
	const nDir = notesDir($i);
	const iDir = indexDir($i);
	fs.mkdirSync(nDir, { recursive: true });
	fs.mkdirSync(iDir, { recursive: true });
	// Clear existing index files (they are derived data).
	for (const f of fs.readdirSync(iDir)) {
		if (f.endsWith('.jsonl')) { try { fs.unlinkSync(path.join(iDir, f)); } catch (_) {} }
	}
	const ids = listNoteIdsDesc($i); // newest first; appends below re-reverse
	let notes = 0, targets = 0;
	const seenFiles = new Set();
	// Walk oldest-first so each index file ends up chronological.
	for (let k = ids.length - 1; k >= 0; k--) {
		const note = readNoteFile($i, ids[k]);
		if (!note || !note.target) continue;
		notes++;
		const file = indexFileFor($i, note.target);
		if (!seenFiles.has(file)) { seenFiles.add(file); targets++; }
		fs.appendFileSync(file, JSON.stringify({ id: note.id, createdAt: note.createdAt }) + '\n');
	}
	return { notes, targets };
}

module.exports = { notesRoot, notesDir, indexDir, targetKeyOf, indexFileFor, newNoteId, writeNoteFile, readNoteFile, appendTargetIndex, createNote, listNoteIdsDesc, listTargetIdsDesc, rebuildIndexes };
