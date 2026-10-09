// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PackedDeployRoutes
 * @description
 * VM-direct deploy API for Awtsmoos.com production.
 *
 * WHY THIS EXISTS: the VM cannot SSH to production (egress proxy blocks port 22)
 * and has no GitHub credentials. This API lets the VM push files directly to
 * production over HTTPS, authenticated by a deploy key — no Mac, no GitHub.
 *
 * Routes (mounted under /api/social by the packed composer):
 *   POST /packed/deploy/push   — write files to the production working tree
 *   GET  /packed/deploy/status — check the API is live and configured
 *
 * Push body: {
 *   operatorKey: string (must match AWTSMOOS_DEPLOY_KEY),
 *   message: string (deploy description, for logging),
 *   files: [{ path: string (repo-relative), content: string (base64) }]
 * }
 *
 * Safety:
 * - Fail-closed operator key (timing-safe compare). Unset key = every call rejected.
 * - Path traversal rejected: paths must resolve inside the repo working tree.
 * - Blocked paths: .git/, node_modules/, secrets, env files, anything outside allowlist roots.
 * - Per-file size cap (5 MB) and per-request file cap (50 files).
 * - Every push is logged to the deploy log.
 *
 * NOTE: files are written directly to the working tree. Server-side Node.js
 * changes require a service restart to take effect; HTML/CSS/client-JS and
 * templates are picked up on the next request without a restart.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { requireMethod, requestValue } = require('./requestValues.js');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const MAX_FILE_BYTES = 5 * 1024 * 1024;      // 5 MB per file
const MAX_FILES_PER_PUSH = 50;               // 50 files per request

// Directories that may receive pushed files. Everything else is rejected.
// Keep this tight: the deploy API is for web-facing code, not secrets.
const ALLOWED_ROOTS = [
	'geelooy/heichelos/',
	'geelooy/api/',
	'geelooy/apps/',
	'geelooy/ohr-haganuz/',
	'geelooy/awtsmoos/',
	'geelooy/scripts/',
	'geelooy/sso/',
	'geelooy/profiles/',
	'geelooy/pulse/',
	'geelooy/onboarding/',
	'geelooy/mitzvahWorld/',
	'geelooy/mikvah/',
	'geelooy/kiddush/',
	'geelooy/home/',
	'geelooy/ikar/',
	'geelooy/derech/',
	'geelooy/components/',
	'geelooy/ai/',
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

/** Resolve the production repo working tree. */
function repoRoot() {
	// The systemd service sets WorkingDirectory to the repo.
	// Fall back to git toplevel if available.
	try {
		const top = execFileSync('git', ['rev-parse', '--show-toplevel'], {
			cwd: process.cwd(), encoding: 'utf8', timeout: 5000,
		}).trim();
		if (top && fs.existsSync(top)) return top;
	} catch {}
	return process.cwd();
}

// ---------------------------------------------------------------------------
// Route class
// ---------------------------------------------------------------------------

class PackedDeployRoutes {
	constructor($i) {
		this.$i = $i;
	}

	routes() {
		return {
			'/packed/deploy/push': this.push.bind(this),
			'/packed/deploy/status': this.status.bind(this),
		};
	}

	// -- authorization -------------------------------------------------------
	// Fail-closed deploy key: the request must carry operatorKey matching
	// process.env.AWTSMOOS_DEPLOY_KEY. When the env var is unset, every
	// call is rejected — never an open deploy door.
	checkAuth() {
		const expected = process.env.AWTSMOOS_DEPLOY_KEY;
		if (!expected) {
			return { success: false, error: 'DEPLOY_NOT_CONFIGURED', message: 'Deploy key is not configured on this server.' };
		}
		const body = this.$i?.body || {};
		const given = body.operatorKey || requestValue(this.$i, 'operatorKey') || '';
		if (!given) return { success: false, error: 'FORBIDDEN', message: 'operatorKey is required.' };
		const a = Buffer.from(String(given));
		const b = Buffer.from(String(expected));
		if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
			return { success: false, error: 'FORBIDDEN', message: 'Invalid operatorKey.' };
		}
		return null;
	}

	/** Validate a repo-relative path. Returns {ok, absPath} or {ok:false, error}. */
	validatePath(relPath, root) {
		if (typeof relPath !== 'string' || !relPath) {
			return { ok: false, error: 'Path must be a non-empty string.' };
		}
		// Reject absolute paths, backslashes, null bytes, and traversal.
		if (path.isAbsolute(relPath) || relPath.includes('\\') || relPath.includes('\0')) {
			return { ok: false, error: `Rejected path: ${relPath}` };
		}
		const normalized = path.posix.normalize(relPath);
		if (normalized.startsWith('..') || normalized === '.' || normalized === '') {
			return { ok: false, error: `Rejected path: ${relPath}` };
		}
		// Block sensitive segments anywhere in the path.
		const segments = normalized.split('/');
		for (const seg of segments) {
			if (BLOCKED_SEGMENTS.has(seg) || seg.startsWith('.env')) {
				return { ok: false, error: `Blocked path segment: ${seg}` };
			}
		}
		// Must live under an allowed root.
		const allowed = ALLOWED_ROOTS.some(r => {
			if (r.endsWith('/')) return normalized === r.slice(0, -1) || normalized.startsWith(r);
			return normalized === r;
		});
		if (!allowed) {
			return { ok: false, error: `Path not in deployable roots: ${relPath}` };
		}
		const absPath = path.resolve(root, normalized);
		if (!absPath.startsWith(root + path.sep) && absPath !== root) {
			return { ok: false, error: `Path escapes repo: ${relPath}` };
		}
		return { ok: true, absPath, normalized };
	}

	async status() {
		const configured = !!process.env.AWTSMOOS_DEPLOY_KEY;
		return {
			success: true,
			configured,
			repo: repoRoot(),
			maxFileBytes: MAX_FILE_BYTES,
			maxFiles: MAX_FILES_PER_PUSH,
		};
	}

	async push() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;

		const body = this.$i?.body || {};
		const files = body.files || [];
		const message = String(body.message || '').slice(0, 500);

		if (!Array.isArray(files) || files.length === 0) {
			return { success: false, error: 'NO_FILES', message: 'files[] is required and must not be empty.' };
		}
		if (files.length > MAX_FILES_PER_PUSH) {
			return { success: false, error: 'TOO_MANY_FILES', message: `Max ${MAX_FILES_PER_PUSH} files per push.` };
		}

		const root = repoRoot();
		const written = [];
		const errors = [];

		for (let n = 0; n < files.length; n++) {
			const f = files[n] || {};
			const v = this.validatePath(f.path, root);
			if (!v.ok) {
				errors.push({ path: f.path, error: v.error });
				continue;
			}
			let buf;
			try {
				buf = Buffer.from(String(f.content || ''), 'base64');
			} catch (e) {
				errors.push({ path: f.path, error: 'Invalid base64 content.' });
				continue;
			}
			if (buf.length > MAX_FILE_BYTES) {
				errors.push({ path: f.path, error: `File exceeds ${MAX_FILE_BYTES} bytes.` });
				continue;
			}
			try {
				fs.mkdirSync(path.dirname(v.absPath), { recursive: true });
				fs.writeFileSync(v.absPath, buf);
				written.push(v.normalized);
			} catch (e) {
				errors.push({ path: f.path, error: e.message });
			}
		}

		appendDeployLog({
			at: new Date().toISOString(),
			message,
			written: written.length,
			errorCount: errors.length,
			paths: written,
			errors: errors.map(e => ({ path: e.path, error: e.error })),
		});

		if (errors.length && !written.length) {
			return { success: false, error: 'ALL_FAILED', written: [], errors };
		}
		return {
			success: true,
			written: written.length,
			paths: written,
			errors,
			message: `B"H deployed ${written.length} file(s).${errors.length ? ` ${errors.length} failed.` : ''}`,
		};
	}
}

module.exports = { PackedDeployRoutes };
