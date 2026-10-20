//B"H
//Blessed is He
//Boruch Hashem

/**
 * Packed deploy configuration, path allowlists, deploy log and repo root (split from deployRoutes.js).
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const MAX_FILE_BYTES = 5 * 1024 * 1024;      // 5 MB per file
const MAX_FILES_PER_PUSH = 50;               // 50 files per request

// Directories that may receive pushed files. Everything else is rejected.
// Covers the full geelooy/ web app tree (pages, styles, client JS, apps);
// blocklisted segments below (.git, node_modules, secrets, env files) stay
// rejected regardless of root. Server-internal ayzarim/ is intentionally
// NOT deployable via this route.
const ALLOWED_ROOTS = [
	'geelooy/',
	'scripts/',
	'ops/',
	'index.js',
	'index.html',
];

// Basename/path-segment blocklist (defense in depth).
const BLOCKED_SEGMENTS = new Set([
	'.git', 'node_modules', '.awtsmoos', '.ssh', '.gnupg',
	'.env', '.env.local', '.env.production',
]);

function deployLogPath() {
	const dir = process.env.AWTSMOOS_DBROOT || '/mnt/HC_Volume_102267213/dayuhChadash';
	return path.join(dir, 'socialPacked', 'deploy-api.log');
}

function appendDeployLog(entry) {
	try {
		const dir = path.dirname(deployLogPath());
		fs.mkdirSync(dir, { recursive: true });
		fs.appendFileSync(deployLogPath(), JSON.stringify(entry) + '\n', 'utf8');
	} catch {}
}

// ---------------------------------------------------------------------------
// Import lock — REMOVED (Yaakov 2026-10-13, absolute law: import jobs must
// NEVER block anything else, ever — not deploys, not restarts, not searches).
//
// WHY REMOVAL IS SAFE:
// - Deploys write to the repo working tree (geelooy/, scripts/, ops/).
//   Imports write to the DB directory ($AWTSMOOS_DBROOT/socialPacked/).
//   These are completely disjoint file trees — a push can never corrupt
//   import data, and an import can never corrupt deployed code.
// - Restart safety comes from the import job's own design, not from a lock:
//   every write is idempotent by content hash, job state is persisted to
//   disk at checkpoints, and a job interrupted by a restart is honestly
//   reported as 'interrupted' so the client resumes it. The packed JSONL
//   format is append-only and crash-safe (partial trailing lines are
//   skipped on read).
// - The 2026-10-11 "502 mid-finalize" incident was a restart killing
//   in-flight requests — a momentary 502 that any restart causes, not
//   data corruption. The fix is fast imports (<5s), not a global lock.
// ---------------------------------------------------------------------------

/** Resolve the production repo working tree. */
function repoRoot() {
	// B"H — Yaakov 2026-10-14: use __dirname, not git/cwd.
	// git rev-parse and process.cwd() are unreliable in production.
	// The deploy API must write to the correct repo path every time.
	return path.resolve(__dirname, '../../../../../..');
}

module.exports = {
	MAX_FILE_BYTES,
	MAX_FILES_PER_PUSH,
	ALLOWED_ROOTS,
	BLOCKED_SEGMENTS,
	deployLogPath,
	appendDeployLog,
	repoRoot,
};
