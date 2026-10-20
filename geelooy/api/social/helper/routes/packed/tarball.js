//B"H
//Blessed is He
//Boruch Hashem

/** @module Tarball
 * Safe extraction of staged import tarballs. Every entry is validated
 * (flat .json files only, no path traversal) before the manifest is
 * trusted. Rejects with TAR_* error codes on any violation.
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
				if (!st.isFile() || n.includes('/') || n.includes('\\') || n.includes('..') || !n.endsWith('.json')) {
					return reject(new Error('TAR_UNSAFE_ENTRY: ' + n));
				}
			}
			if (!names.includes('manifest.json')) return reject(new Error('TAR_NO_MANIFEST'));
			resolve(dest);
		});
	});
}

module.exports = { extractTarball };
