//B"H
//Blessed is He
//Boruch Hashem

/** @module Tarball
 * Safe extraction of staged import tarballs. Every entry is validated
 * (flat .json files only, no path traversal) before the manifest is
 * trusted. Rejects with TAR_* error codes on any violation.
 *
 * B"H 2026-11-10 (bulk-import fix): a staged UPDATE set is a tarball
 * holding manifest.json + updates.jsonl (see updateJobMixin, which
 * streams exactly that file). The flat-file whitelist used to reject
 * every non-.json entry, so updates.jsonl always died with
 * TAR_UNSAFE_ENTRY and the staged update-job path could never run —
 * the one staged upload that tried it (22a6a54a…) is unreadable to
 * this day. The single exact name 'updates.jsonl' is now allowed
 * alongside flat *.json entries; every other rule (flat, no '..',
 * regular file, manifest.json required) is unchanged.
 */

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { stageRoot } = require('./jobLog.js');


// ---------------------------------------------------------------------------
// Staged tarball reading (reuses the /packed/import/bulk/stage upload dir).
// Tarball layout: files/manifest.json + one post-document *.json per file.
// manifest.json: { files: [{ file, postId, heichelId? }], postCount? }
// ---------------------------------------------------------------------------
function extractTarball($i, uploadId) {
	const dir = path.join(stageRoot($i), uploadId);
	return new Promise((resolve, reject) => {
		const dest = path.join(dir, 'files');
		if (fs.existsSync(path.join(dest, 'manifest.json'))) return resolve(dest);
		fs.mkdirSync(dest, { recursive: true });
		execFile('tar', ['-xzf', path.join(dir, 'upload.tar.gz'), '-C', dest], (err, _stdout, stderr) => {
			if (err) return reject(new Error('TAR_EXTRACT_FAILED: ' + (stderr || err.message)));
			let names;
			try { names = fs.readdirSync(dest); }
			catch (e) { return reject(new Error('TAR_LIST_FAILED: ' + e.message)); }
			for (const n of names) {
				let st;
				try { st = fs.statSync(path.join(dest, n)); }
				catch (_) { return reject(new Error('TAR_UNSAFE_ENTRY: ' + n)); }
				if (!st.isFile() || n.includes('/') || n.includes('\\') || n.includes('..') || !(n.endsWith('.json') || n === 'updates.jsonl')) {
					return reject(new Error('TAR_UNSAFE_ENTRY: ' + n));
				}
			}
			if (!names.includes('manifest.json')) return reject(new Error('TAR_NO_MANIFEST'));
			resolve(dest);
		});
	});
}

module.exports = { extractTarball };
