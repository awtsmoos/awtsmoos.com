// B"H
/**
 * @module ProfileReadCache
 * @description
 * Short-TTL in-process memo for the profile system's heavy read
 * sections (posts / comments / heichelos / tree / owned-heichel scan).
 *
 * WHY THIS EXISTS (2026-11-20, profile data-layer fix): every profile
 * section re-walked storage on every request — the tree walk is 3
 * store reads per series node across every owned heichel, and the
 * owned-heichel scan reads every heichel's info record; three of the
 * five aggregate sections each re-ran that scan independently. The
 * DosDB read cache below this layer expires after 30s / 1000 entries,
 * so on this 1.9GB box a profile view routinely paid the full walk:
 * measured 55.6s for one /api/social/profile aggregate under load
 * (comments 40s, heichelos 40s, tree 55.6s) against 5ms warm — past
 * the dashboard's 12s boot budget and the proxy timeout, so pages
 * died at "Loading profile...". Memoizing each section for 45s (the
 * house pattern: heichelName 120s, aliasData 60s, DosDB 30s)
 * collapses repeat views to one walk, and in-flight coalescing means
 * concurrent identical requests share that walk instead of
 * multiplying it. Rejections are evicted immediately — failures are
 * never cached. Callers must treat returned values as read-only;
 * every current consumer only reads or slices them.
 */

const TTL_MS = 45000;
const MAX_ENTRIES = 512;
const entries = new Map(); // key -> { promise, exp }

function memoizedRead(key, producer) {
	const now = Date.now();
	const hit = entries.get(key);
	if (hit && hit.exp > now) return hit.promise;
	const promise = Promise.resolve().then(producer);
	promise.catch(() => {
		const current = entries.get(key);
		if (current && current.promise === promise) entries.delete(key);
	});
	entries.set(key, { promise, exp: now + TTL_MS });
	while (entries.size > MAX_ENTRIES) {
		entries.delete(entries.keys().next().value);
	}
	return promise;
}

module.exports = { memoizedRead, PROFILE_READ_TTL_MS: TTL_MS };
