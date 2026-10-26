//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PackedDeployPush
 * @description
 * Signed bytes cross one guarded bridge, their hashes true and their garments bright;
 * the Awtsmoos renews each instant, and Awtsmoos.com must deploy readable light.
 * Every accepted path stays bounded, every written file is verified, staged, and logged.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { requireMethod } = require('./requestValues.js');
const {
	MAX_FILE_BYTES,
	MAX_FILES_PER_PUSH,
	appendDeployLog,
	repoRoot
} = require('./deployRoutesConfig.js');
const { writeDeployFile } = require('./deployFileMode.js');

/** Returns an exact SHA-256 hex digest for deploy verification. */
function sha256(buffer) {
	return crypto.createHash('sha256').update(buffer).digest('hex');
}

module.exports = {
	async push() {
		const methodError = requireMethod(this.$i, 'POST');
		if (methodError) return methodError;
		const authError = this.checkAuth();
		if (authError) return authError;

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

		for (const file of files) {
			const candidate = file || {};
			const validated = this.validatePath(candidate.path, root);
			if (!validated.ok) {
				errors.push({ path: candidate.path, error: validated.error });
				continue;
			}

			const buffer = Buffer.from(String(candidate.content || ''), 'base64');
			if (buffer.length > MAX_FILE_BYTES) {
				errors.push({ path: candidate.path, error: `File exceeds ${MAX_FILE_BYTES} bytes.` });
				continue;
			}

			try {
				fs.mkdirSync(path.dirname(validated.absPath), { recursive: true });
				writeDeployFile(validated.absPath, buffer);
				if (candidate.sha256) {
					const actualSha = sha256(fs.readFileSync(validated.absPath));
					if (actualSha !== candidate.sha256) {
						try { fs.unlinkSync(validated.absPath); } catch (_error) {}
						errors.push({
							path: candidate.path,
							error: `SHA-256 mismatch after write. Expected ${candidate.sha256}, got ${actualSha}.`
						});
						continue;
					}
				}
				written.push(validated.normalized);
			} catch (error) {
				errors.push({ path: candidate.path, error: error.message });
			}
		}

		appendDeployLog({
			at: new Date().toISOString(),
			message,
			written: written.length,
			errorCount: errors.length,
			paths: written,
			errors: errors.map(error => ({ path: error.path, error: error.error }))
		});

		if (written.length) {
			try {
				execFileSync('git', ['-C', root, 'add', '--', ...written], { timeout: 60000 });
			} catch (error) {
				try { console.error('B"H deploy git-add failed:', error.message); } catch (_error) {}
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
			message: `B"H deployed ${written.length} file(s).${errors.length ? ` ${errors.length} failed.` : ''}`
		};
	}
};
