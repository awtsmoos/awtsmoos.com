//B"H
//Blessed is He
//Boruch Hashem

/** @module SubmissionsStore
 * Storage for the packed submissions system (Worker J, 2026-10-21,
 * user order ~19:58 EDT: users/agents submit posts into someone else's
 * heichel; the owner reviews; decisions are logged and reversible).
 *
 * Design (mirrors notesStore.js / jobState.js conventions):
 *   - Source of truth: ONE JSON FILE PER SUBMISSION at
 *       <dbRoot>/socialPacked/submissions/records/<submissionId>.json
 *     written atomically (tmp + rename). Id = 'sub_' + <createdAtMs
 *     base36> + '_' + <6 random bytes hex>, so lexicographic filename
 *     order IS chronological order.
 *   - Derived per-heichel and per-submitter indexes: append-only JSONL
 *     under by-heichel/<sha256(heichelId)[:32]>.jsonl and
 *     by-submitter/<sha256(identity)[:32]>.jsonl, one {"id","createdAt"}
 *     line per submission. Readers load each record file and skip ids
 *     whose file is gone, so a stale index can never invent a record.
 *   - Decisions log: append-only JSONL per heichel at
 *     decisions/<sha256(heichelId)[:32]>.jsonl — every approve / deny /
 *     reversal (human or agent) appends exactly one line with its
 *     basis. Readers tail-read the file (bounded bytes) newest-first.
 *
 * dbRoot resolution mirrors jobState.js exactly.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function submissionsRoot($i) {
	const dir = $i?.db?.directory || $i?.db?.root || process.env.AWTSMOOS_DBROOT || '/mnt/HC_Volume_102267213/dayuhChadash';
	return path.join(dir, 'socialPacked', 'submissions');
}

function recordsDir($i) { return path.join(submissionsRoot($i), 'records'); }
function byHeichelDir($i) { return path.join(submissionsRoot($i), 'by-heichel'); }
function bySubmitterDir($i) { return path.join(submissionsRoot($i), 'by-submitter'); }
function decisionsDir($i) { return path.join(submissionsRoot($i), 'decisions'); }

function hashKey(s) {
	return crypto.createHash('sha256').update(String(s || ''), 'utf8').digest('hex').slice(0, 32);
}

function newSubmissionId(now) {
	return 'sub_' + now.toString(36) + '_' + crypto.randomBytes(6).toString('hex');
}

function safeId(id) {
	if (typeof id !== 'string' || !id || id.length > 128) return null;
	if (!/^[A-Za-z0-9_-]+$/.test(id)) return null;
	return id;
}

/** Atomic single-record write: tmp file in the same dir + rename. */
function writeRecord($i, rec) {
	const dir = recordsDir($i);
	fs.mkdirSync(dir, { recursive: true });
	const tmp = path.join(dir, rec.id + '.json.tmp-' + process.pid + '-' + crypto.randomBytes(3).toString('hex'));
	fs.writeFileSync(tmp, JSON.stringify(rec));
	fs.renameSync(tmp, path.join(dir, rec.id + '.json'));
}

function readRecord($i, id) {
	const safe = safeId(id);
	if (!safe) return null;
	try {
		return JSON.parse(fs.readFileSync(path.join(recordsDir($i), safe + '.json'), 'utf8'));
	} catch (_) { return null; }
}

function deleteRecord($i, id) {
	const safe = safeId(id);
	if (!safe) return false;
	try { fs.unlinkSync(path.join(recordsDir($i), safe + '.json')); return true; } catch (_) { return false; }
}

function appendLine(file, obj) {
	try {
		fs.mkdirSync(path.dirname(file), { recursive: true });
		fs.appendFileSync(file, JSON.stringify(obj) + '\n');
	} catch (_) { /* derived/log appends are best-effort; record file is truth */ }
}

function indexSubmission($i, rec) {
	appendLine(path.join(byHeichelDir($i), hashKey(rec.targetHeichel) + '.jsonl'),
		{ id: rec.id, createdAt: rec.createdAt });
	appendLine(path.join(bySubmitterDir($i), hashKey(rec.submitterIdentity) + '.jsonl'),
		{ id: rec.id, createdAt: rec.createdAt });
}

/** Ids from a JSONL index file, newest first (file order is chrono). */
function listIndexIdsDesc(file) {
	try {
		const raw = fs.readFileSync(file, 'utf8');
		const ids = [];
		for (const line of raw.split('\n')) {
			if (!line.trim()) continue;
			try { const row = JSON.parse(line); if (row && row.id) ids.push(row.id); } catch (_) { /* torn line */ }
		}
		return ids.reverse();
	} catch (_) { return []; }
}

function listHeichelIdsDesc($i, heichelId) {
	return listIndexIdsDesc(path.join(byHeichelDir($i), hashKey(heichelId) + '.jsonl'));
}

function listSubmitterIdsDesc($i, identity) {
	return listIndexIdsDesc(path.join(bySubmitterDir($i), hashKey(identity) + '.jsonl'));
}

function decisionsFile($i, heichelId) {
	return path.join(decisionsDir($i), hashKey(heichelId) + '.jsonl');
}

function appendDecision($i, entry) {
	appendLine(decisionsFile($i, entry.heichelId), entry);
}

/** Newest-first decisions for one heichel, from a bounded tail read. */
function listDecisionsDesc($i, heichelId, maxBytes = 1024 * 1024) {
	const file = decisionsFile($i, heichelId);
	let raw = '';
	try {
		const st = fs.statSync(file);
		const start = Math.max(0, st.size - maxBytes);
		const fd = fs.openSync(file, 'r');
		try {
			const buf = Buffer.alloc(st.size - start);
			fs.readSync(fd, buf, 0, buf.length, start);
			raw = buf.toString('utf8');
		} finally { fs.closeSync(fd); }
		if (start > 0) {
			const nl = raw.indexOf('\n');
			raw = nl >= 0 ? raw.slice(nl + 1) : '';
		}
	} catch (_) { return []; }
	const out = [];
	for (const line of raw.split('\n')) {
		if (!line.trim()) continue;
		try { const row = JSON.parse(line); if (row && row.submissionId) out.push(row); } catch (_) { /* torn line */ }
	}
	return out.reverse();
}

module.exports = {
	submissionsRoot, recordsDir, decisionsDir, hashKey, newSubmissionId, safeId,
	writeRecord, readRecord, deleteRecord, indexSubmission,
	listHeichelIdsDesc, listSubmitterIdsDesc, appendDecision, listDecisionsDesc
};
