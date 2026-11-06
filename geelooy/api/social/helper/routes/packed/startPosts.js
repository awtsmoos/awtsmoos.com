//B"H
//Blessed is He
//Boruch Hashem

/** @module StartPosts
 * Resolves the post list for an import start request: either a staged
 * upload (uploadId -> tarball entries) or inline posts[] with the count
 * and byte-size caps. Returns { posts, source, stagedDir } on success,
 * or the route error object verbatim on failure (callers distinguish
 * by the absence of .posts).
 */

const { requestValue } = require('./requestValues.js');
const { INLINE_POSTS_MAX_COUNT, INLINE_POSTS_MAX_BYTES } = require('./importBounds.js');

// Bulk-upload redesign §3.2/§3.9: inline is a convenience only — the old
// 500-post / ~20 MB caps are retired as misleading (a 14 MB inline start
// already 413s below the app, E1). Inline stays for ≤ 100 posts / ≤ 5 MB;
// everything larger goes through the staged chunked upload. The shared
// importBounds caps are NOT changed here: notesMixin reuses them for its
// own bulk cap.
const INLINE_START_MAX_COUNT = 100;
const INLINE_START_MAX_BYTES = 5 * 1024 * 1024;

async function resolveStartPosts(routes, $i, body) {
		let posts;
		let source;
		let stagedDir = null;
		// NOTE: the framework populates $i.$_POST for JSON bodies, not $i.body.
		const uploadId = body.uploadId || requestValue($i, 'uploadId');
		if (uploadId) {
			const loaded = await routes.loadStagedPosts($i, String(uploadId));
			if (loaded.error) return loaded.error;
			posts = loaded.entries;
			source = loaded.source;
			stagedDir = loaded.dest;
		} else {
			const inline = body.posts ?? requestValue($i, 'posts');
			if (!Array.isArray(inline) || inline.length === 0) {
				return { success: false, error: 'NO_POSTS', message: 'Provide posts[] (inline) or uploadId (staged tarball).' };
			}
			if (inline.length > INLINE_START_MAX_COUNT) {
				return {
					success: false, error: 'INLINE_TOO_LARGE',
					message: 'Inline posts exceed ' + INLINE_START_MAX_COUNT + ' (' + inline.length + ' given). Use POST /packed/import/bulk/stage (chunked upload), then pass uploadId.',
				};
			}
			let approxBytes = 0;
			for (const p of inline) {
				try { approxBytes += Buffer.byteLength(JSON.stringify(p)); }
				catch (_) { approxBytes += 1024; }
				if (approxBytes > INLINE_START_MAX_BYTES) {
					return {
						success: false, error: 'INLINE_TOO_LARGE',
						message: 'Inline payload exceeds ~5 MB. Use POST /packed/import/bulk/stage (chunked upload), then pass uploadId.',
					};
				}
			}
			posts = inline;
			source = 'inline';
		}
	return { posts: posts, source: source, stagedDir: stagedDir };
}

module.exports = { resolveStartPosts };
