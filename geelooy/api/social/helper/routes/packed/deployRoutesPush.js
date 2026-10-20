//B"H
//Blessed is He
//Boruch Hashem

/**
 * PackedDeployRoutes signed file push endpoint (split from deployRoutes.js).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { requireMethod, requestValue } = require('./requestValues.js');
const { MAX_FILE_BYTES, appendDeployLog, repoRoot } = require('./deployRoutesConfig.js');

module.exports = {
	async push() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) return bad;
		const auth = this.checkAuth();
		if (auth) return auth;
		// B"H 2026-10-13: no import lock — deploys write to the repo tree,
		// imports write to the DB dir. Disjoint; never block each other.

		const body = this.$i?.body || {};
		const files = body.files || this.$i?.$_POST?.files || [];
		const message = String(body.message || this.$i?.$_POST?.message || '').slice(0, 500);

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
				// B"H — Yaakov 2026-10-14: verify the written bytes match the expected SHA-256.
				// If the client sent a sha256, read back the file and compare. Fail on mismatch.
				// This ensures the deploy actually wrote the correct bytes.
				if (f.sha256) {
					const writtenBuf = fs.readFileSync(v.absPath);
					const actualSha = crypto.createHash('sha256').update(writtenBuf).digest('hex');
					if (actualSha !== f.sha256) {
						// Delete the corrupted file and report error.
						try { fs.unlinkSync(v.absPath); } catch {}
						errors.push({ path: f.path, error: `SHA-256 mismatch after write. Expected ${f.sha256}, got ${actualSha}.` });
						continue;
					}
				}
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

		// B"H: keep the git index truthful — the release bundle builder reads
		// membership from the index, so deployed files must be staged. A signed
		// deploy is the deliberate gathering; never fail the deploy on git.
		if (written.length) {
			try {
				execFileSync('git', ['-C', root, 'add', '--', ...written], { timeout: 60000 });
			} catch (e) {
				try { console.error('B"H deploy git-add failed:', e.message); } catch {}
			}
		}

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
};
