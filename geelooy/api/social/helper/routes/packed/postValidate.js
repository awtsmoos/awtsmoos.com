//B"H
//Blessed is He
//Boruch Hashem

/** @module PostValidate
 * Post validation, prototype-pollution-safe cloning, normalization,
 * canonical byte form, and content hashing. The canonical form defines
 * import idempotency: same canonical bytes = same hash = skip.
 * AI SAFEGUARD: canonicalBytes/contentHash changes alter dedup
 * semantics for every past import. Never change them casually.
 */

const crypto = require('crypto');


// ---------------------------------------------------------------------------
// Post validation + normalization.
// A post document needs an identity (postId) and a home (heichelId).
// Everything else is carried through verbatim — the readers, not the
// importer, own the schema. We never invent content: missing optional
// fields stay missing; we only fill identity + bookkeeping timestamps.
// ---------------------------------------------------------------------------
function validatePost(raw, idx) {
	if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
		return 'post ' + idx + ': not an object';
	}
	const postId = raw.postId || raw.id;
	if (!postId || typeof postId !== 'string' || !postId.trim()) {
		return 'post ' + idx + ': missing postId (or id)';
	}
	return null;
}


/** Prototype-pollution-safe deep clone for untrusted post documents. */
function cleanClone(value, depth) {
	if (depth > 32) throw new Error('POST_TOO_DEEP');
	if (value === null || typeof value !== 'object') return value;
	if (Array.isArray(value)) return value.map(v => cleanClone(v, depth + 1));
	const out = {};
	for (const k of Object.keys(value)) {
		if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
		out[k] = cleanClone(value[k], depth + 1);
	}
	return out;
}


function normalizePost(raw, heichelId, now) {
	const post = cleanClone(raw, 0);
	const postId = String(post.postId || post.id).trim();
	post.postId = postId;
	post.id = post.id || postId;
	post.heichelId = post.heichelId || heichelId;
	if (!post.heichelId || typeof post.heichelId !== 'string' || !post.heichelId.trim()) {
		throw new Error('POST_NO_HEICHEL: post ' + postId + ' carries no heichelId and the job set none');
	}
	post.seriesId = post.seriesId || post.parentSeriesId || 'root';
	post.parentSeriesId = post.parentSeriesId || post.seriesId;
	post.importedFrom = 'post-import-api';
	post.importedAt = now;
	post.updatedAt = post.updatedAt || now;
	return post;
}


/** Canonical bytes for the idempotency hash: stable key order, no whitespace. */
function canonicalBytes(post) {
	const seen = new Set();
	function sortKeys(v) {
		if (v === null || typeof v !== 'object') return v;
		if (seen.has(v)) return '[Circular]';
		seen.add(v);
		if (Array.isArray(v)) return v.map(sortKeys);
		const out = {};
		for (const k of Object.keys(v).sort()) out[k] = sortKeys(v[k]);
		return out;
	}
	// B"H 2026-10-14 (import-speed): contentHash excluded — the pre-hashed
	// posts protocol lets the client ship its computed hash inside the post
	// document; it must not perturb the hash itself.
	const { importedAt, updatedAt, contentHash: _preHash, ...rest } = post;
	return Buffer.from(JSON.stringify(sortKeys(rest)), 'utf8');
}


function contentHash(post) {
	return crypto.createHash('sha256').update(canonicalBytes(post)).digest('hex');
}


/**
 * Validate a client-supplied pre-computed content hash. Returns the
 * normalized lowercase hex string, or null when absent/malformed (in which
 * case the server computes the hash itself — fail safe).
 */
function validPreHash(obj) {
	const h = obj && obj.contentHash;
	return (typeof h === 'string' && /^[0-9a-f]{64}$/i.test(h)) ? h.toLowerCase() : null;
}


/**
 * Derive the aliasId for a post: one alias per commentator (the bare
 * slug of the commentator name), falling back to the job-level alias
 * when the post carries no commentator. Exported so the VM client
 * computes identical expectations during verification.
 *
 * ALIAS NAMING LAW (user order 2026-10-21, absolute): an aliasId must
 * NEVER contain the heichel name — aliases are global identities, not
 * per-heichel names. The Rebbe's alias is `theRebbe`, NOT
 * `ikar-the-rebbe`. So: no heichel prefix is ever prepended, a leading
 * heichel-name segment inside the commentator's own name is stripped,
 * and the slug `the-rebbe` maps to the canonical `theRebbe`.
 */
function deriveAliasId(commentator, heichelId, fallbackAliasId) {
	if (commentator && typeof commentator === 'string' && commentator.trim()) {
		const slug = commentator.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
		if (slug) {
			if (slug === 'the-rebbe') return 'theRebbe';
			const h = String(heichelId || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
			if (h && slug !== h && slug.startsWith(h + '-')) {
				const rest = slug.slice(h.length + 1);
				if (rest === 'the-rebbe') return 'theRebbe';
				if (rest) return rest;
			}
			return slug;
		}
	}
	return fallbackAliasId;
}

module.exports = { validatePost, cleanClone, normalizePost, canonicalBytes, contentHash, validPreHash, deriveAliasId };
