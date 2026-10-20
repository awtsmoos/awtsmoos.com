//B"H
//Blessed is He
//Boruch Hashem

/** @module ImportBounds
 * Hard bounds for the post importer (OOM guards) and the per-series
 * mutex that serializes series-index flushes. One job at a time since
 * 2026-10-20 (crash-guard): the box cannot survive concurrent jobs.
 * AI SAFEGUARD: these caps protect a 2 GB production server. Do not
 * raise them without the user explicit order.
 */

const INLINE_POSTS_MAX_COUNT = 500;
const INLINE_POSTS_MAX_BYTES = 20 * 1024 * 1024; // ~20 MB wire estimate
const PER_POST_MAX_BYTES = 5 * 1024 * 1024; // 5 MB per post document
const UPLOAD_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;
// B"H 2026-10-20 (crash-guard): ONE job at a time. The 2026-10-13
// "import-speed" raise to 4 caused the 2026-10-20 00:01 EDT hang: three
// publishers started three jobs at once and Node's event loop starved
// for 10+ minutes on a 2 GB box. Speed never outruns stability.
const MAX_CONCURRENT_PER_HEICHEL = 1;
const seriesLocks = new Map();


async function acquireSeriesLock(key) {
	while (seriesLocks.has(key)) {
		try { await seriesLocks.get(key); } catch (_) { /* ignore */ }
	}
	let release;
	const p = new Promise(resolve => { release = resolve; });
	seriesLocks.set(key, p);
	return () => {
		if (seriesLocks.get(key) === p) seriesLocks.delete(key);
		try { release(); } catch (_) { /* ignore */ }
	};
}

module.exports = { INLINE_POSTS_MAX_COUNT, INLINE_POSTS_MAX_BYTES, PER_POST_MAX_BYTES, UPLOAD_ID_RE, MAX_CONCURRENT_PER_HEICHEL, acquireSeriesLock };
