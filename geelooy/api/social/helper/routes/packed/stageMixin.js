//B"H
//Blessed is He
//Boruch Hashem

/** @module StageMixin
 * Reading staged uploads: maps a manifest entry to its parsed post
 * document, and loads a whole staged tarball into import entries.
 */

const fs = require('fs');
const path = require('path');
const { contentHash, validPreHash } = require('./postValidate.js');
const { extractTarball } = require('./tarball.js');
const { UPLOAD_ID_RE, PER_POST_MAX_BYTES } = require('./importBounds.js');

module.exports = {

	// Resolve one spec item to a raw post document. Inline items are already
	// parsed objects; staged items are { file, postId?, heichelId? } entries
	// parsed lazily here — exactly one file in memory at a time.
	readSpecPost(spec, item) {
		if (spec.source && spec.source.startsWith('upload:') && item && typeof item.file === 'string') {
			const full = path.join(spec.stagedDir, item.file);
			let parsed;
			try {
				parsed = JSON.parse(fs.readFileSync(full, 'utf8'));
			} catch (e) {
				throw new Error('STAGED_FILE_UNPARSEABLE: ' + item.file + ': ' + e.message);
			}
			if (item.postId && !parsed.postId && !parsed.id) parsed.postId = item.postId;
			if (item.heichelId && !parsed.heichelId) parsed.heichelId = item.heichelId;
			return parsed;
		}
		return item;
	},


	// -- staged upload reading --------------------------------------------------
	async loadStagedPosts($i, uploadId) {
		if (!UPLOAD_ID_RE.test(uploadId)) {
			return { error: { success: false, error: 'BAD_UPLOAD_ID', message: 'uploadId must match [A-Za-z0-9_-]{8,64}' } };
		}
		let dest;
		try {
			dest = await extractTarball($i, uploadId);
		} catch (e) {
			return { error: { success: false, error: 'STAGE_READ_FAILED', message: e.message } };
		}
		let manifest;
		try {
			manifest = JSON.parse(fs.readFileSync(path.join(dest, 'manifest.json'), 'utf8'));
		} catch (e) {
			return { error: { success: false, error: 'MANIFEST_UNREADABLE', message: e.message } };
		}
		const files = Array.isArray(manifest.files) ? manifest.files : [];
		if (!files.length) {
			return { error: { success: false, error: 'MANIFEST_EMPTY', message: 'No post files listed in manifest.json' } };
		}
		// STREAMING: never parse post files here. Return lightweight entries;
		// runJob reads + parses exactly one file at a time. Holding all parsed
		// posts would spike heap by ~3-5x the tarball size (OOM risk).
		const entries = [];
		for (const f of files) {
			const name = f && f.file;
			if (!name || typeof name !== 'string' || name.includes('/') || name.includes('\\') || name.includes('..') || !name.endsWith('.json')) {
				return { error: { success: false, error: 'MANIFEST_BAD_ENTRY', message: 'Unsafe file entry: ' + String(name) } };
			}
			const full = path.join(dest, name);
			let st;
			try { st = fs.statSync(full); }
			catch (_) { return { error: { success: false, error: 'STAGED_FILE_MISSING', message: name } }; }
			if (!st.isFile() || st.size > PER_POST_MAX_BYTES) {
				return { error: { success: false, error: 'STAGED_FILE_TOO_LARGE', message: name } };
			}
			entries.push({
				file: name, postId: f.postId || null, heichelId: f.heichelId || null,
				// B"H 2026-10-14 (import-speed): pre-hashed posts protocol —
				// pass the client's contentHash through (validated 64-hex);
				// the server trusts it but re-verifies a 1% sample.
				contentHash: validPreHash(f),
			});
		}
		return { entries, dest, source: 'upload:' + uploadId };
	}
};
