//B"H
//Blessed is He
//Boruch Hashem

/** @module ProcessOneValidate
 * First half of per-post processing: reads the staged/inline spec entry,
 * validates identity, normalizes the document, applies the alias, enforces
 * the per-post size cap, and resolves the content hash (honoring trusted
 * client pre-hashes with 1% re-verification).
 * Returns null on any failure (job.failed/errors already recorded), or
 * { post, hash, aliasName } for the write phase.
 * AI SAFEGUARD: the hash decides idempotency. Keep hash computation
 * identical to processOneWrite's expectations.
 */

const { validatePost, normalizePost, canonicalBytes, contentHash, validPreHash } = require('./postValidate.js');
const { appendJobLog } = require('./jobLog.js');
const { PER_POST_MAX_BYTES } = require('./importBounds.js');

async function processOneValidate(ctx, n) {
	const { routes, $i, job, spec, now } = ctx;
			let raw;
			try {
				raw = routes.readSpecPost(spec, spec.posts[n]);
			} catch (e) {
				job.failed++;
				job.errors.push({ postId: String((spec.posts[n] && spec.posts[n].postId) || ('#' + n)), message: e.message });
				return null;
			}
			let post;
			let aliasName;
			try {
				const verr = validatePost(raw, n);
				if (verr) throw new Error(verr);
				post = normalizePost(raw, spec.heichelId, now);
				// Alias application (before the idempotency hash: the
				// alias is part of the post's identity).
				aliasName = (post.commentator && String(post.commentator).trim()) || spec.aliasName;
				post.aliasId = routes.postAliasId(post, spec.heichelId, spec.aliasId);
				const wireBytes = Buffer.byteLength(canonicalBytes(post));
				if (wireBytes > PER_POST_MAX_BYTES) {
					throw new Error('POST_TOO_LARGE: post ' + post.postId + ' is ' + wireBytes + ' bytes (cap ' + PER_POST_MAX_BYTES + ')');
				}
			} catch (e) {
				job.failed++;
				job.errors.push({ postId: String((raw && (raw.postId || raw.id)) || ('#' + n)), message: e.message });
				return null;
			}
			// B"H 2026-10-14 (import-speed): pre-hashed posts protocol. The client
		// may ship contentHash (tarball manifest entry or post field); the
		// server trusts it but re-verifies a 1% sample by recomputation.
		// Repeated mismatch flips the job to compute every hash (fail safe).
		let hash;
		const suppliedHash = validPreHash(spec.posts[n]) || validPreHash(post);
		if (suppliedHash && !job.preHashUntrusted) {
			hash = suppliedHash;
			job.preHashed++;
			if (job.preHashed % 100 === 1) {
				const recomputed = contentHash(post);
				if (recomputed === hash) {
					job.preHashVerified++;
				} else {
					job.preHashMismatches++;
					appendJobLog($i, { jobId: job.id, event: 'prehash-mismatch', postId: post.postId });
					hash = recomputed;
					if (job.preHashMismatches >= 3) {
						job.preHashUntrusted = true;
						appendJobLog($i, { jobId: job.id, event: 'prehash-untrusted', message: 'client hashes failed verification 3x; computing all hashes server-side' });
					}
				}
			}
		} else {
			hash = contentHash(post);
		}
	return { post: post, hash: hash, aliasName: aliasName };
}

module.exports = { processOneValidate };
