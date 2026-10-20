//B"H
//Blessed is He
//Boruch Hashem

/**
 * PackedDeployRoutes core: constructor, route map, signature auth and path validation (split from deployRoutes.js).
 */

const path = require('path');
const { requireMethod, requestValue } = require('./requestValues.js');
const {
	DEPLOY_SIGN_PUBLIC_KEYS,
	verifySignature,
	checkTimestamp,
	checkReplay,
} = require('./deploySign.js');
const { ALLOWED_ROOTS, BLOCKED_SEGMENTS } = require('./deployRoutesConfig.js');

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
			'/packed/deploy/restart': this.restart.bind(this),
		};
	}

	// -- authorization -------------------------------------------------------
	// Ed25519 signature ONLY (MAC-SEVERANCE Phase 2, cutover complete).
	// The shared-secret operatorKey path was removed: env-var secrets get
	// wiped on restart, while the public key in deploySign.js survives every
	// restart and is auditable in git. The private key lives only on the VM.
	checkAuth() {
		const body = this.$i?.body || {};
		const files = body.files || this.$i?.$_POST?.files || [];
		const message = String(body.message ?? this.$i?.$_POST?.message ?? '');

		const sig = body.sig || requestValue(this.$i, 'sig') || '';
		if (!sig) {
			return { success: false, error: 'FORBIDDEN', message: 'Deploy auth required: Ed25519 sig.' };
		}
		const ts = body.ts ?? requestValue(this.$i, 'ts');
		const tchk = checkTimestamp(ts);
		if (!tchk.ok) {
			return { success: false, error: 'FORBIDDEN', message: `Deploy signature rejected: ${tchk.error}.` };
		}
		const vchk = verifySignature({ ts, message, files }, sig);
		if (!vchk.ok) {
			return { success: false, error: 'FORBIDDEN', message: `Deploy signature rejected: ${vchk.error}.` };
		}
		const rchk = checkReplay(String(sig), ts);
		if (!rchk.ok) {
			return { success: false, error: 'FORBIDDEN', message: `Deploy signature rejected: ${rchk.error}.` };
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
}

module.exports = { PackedDeployRoutes };
