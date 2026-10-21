//B"H
//Blessed is He
//Boruch Hashem

/**
 * BulkPublishAllRoutes staged tarball extraction (split from bulkPublishAllRoutes.js).
 */

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { uploadDir } = require('./bulkPublishAllRoutesPaths.js');

module.exports = {
	/** Extract the staged tarball (idempotent: skipped when already extracted). */
	extractTarball($i, uploadId) {
		const dir = uploadDir($i, uploadId);
		return new Promise((resolve, reject) => {
			const dest = path.join(dir, 'files');
			fs.mkdirSync(dest, { recursive: true });
			execFile('tar', ['-xzf', path.join(dir, 'upload.tar.gz'), '-C', dest], (err, _stdout, stderr) => {
				if (err) return reject(new Error('TAR_EXTRACT_FAILED: ' + (stderr || err.message)));
				let names;
				try {
					names = fs.readdirSync(dest);
				} catch (e) {
					return reject(new Error('TAR_LIST_FAILED: ' + e.message));
				}
				for (const n of names) {
					const p = path.join(dest, n);
					let st;
					try {
						st = fs.statSync(p);
					} catch (_) {
						return reject(new Error('TAR_UNSAFE_ENTRY: ' + n));
					}
					// Prebuilt manifests (instant mode) carry .bin files
					// (pre-serialized AwtsmoosDB records); standard carries .json.
					const okExt = n.endsWith('.json') || n.endsWith('.bin');
					if (!st.isFile() || n.includes('/') || n.includes('\\') || n.includes('..') || !okExt) {
						return reject(new Error('TAR_UNSAFE_ENTRY: ' + n));
					}
				}
				if (!names.includes('manifest.json')) return reject(new Error('TAR_NO_MANIFEST'));
				resolve(names);
			});
		});
	}
};
