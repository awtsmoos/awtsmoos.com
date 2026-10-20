//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module SafeRecordRead
 * @description
 * The poison-proof read helper (safeguards program, 2026-10-20).
 *
 * WHY THIS EXISTS: on 2026-10-20 one directory sitting where a
 * file was expected threw EISDIR through a listing reader, busted
 * the grouped cache, forced a 197 MB rescan and flapped the whole
 * site every ~2 minutes. The rule this module enforces everywhere:
 *
 *   ONE BAD RECORD DEGRADES ONE READ. IT NEVER THROWS.
 *
 * Wrap any read that touches stored records — list reads, profile
 * sections, per-record fetches — with safeRecordRead(). On success
 * the value passes through (optionally shape-validated). On EISDIR /
 * parse / shape / IO error the read returns the caller's fallback,
 * the path is counted in poisonQuarantine, and after the 2nd error
 * the path is quarantined: later reads skip it without reading.
 *
 * ENOENT is NOT poison: a missing record is a normal "not found"
 * and returns the fallback silently, uncounted.
 *
 * @example
 * const posts = await safeRecordRead(postsPath,
 *   () => $i.db.read(postsPath), { fallback: [], tag: 'profile:posts' });
 */

const { notePoison, isQuarantined } = require('./poisonQuarantine.js');

/** @constant {number} Min ms between [POISON-SKIP] log lines per path. */
const SKIP_LOG_EVERY_MS = 60000;
/** @type {Map<string, number>} last skip-log time per path */
const lastSkipLog = new Map();

/**
 * Logs a quarantine skip, at most once per minute per path.
 * @param {string} path
 */
function logSkip(path) {
	const now = Date.now();
	if (now - (lastSkipLog.get(path) || 0) < SKIP_LOG_EVERY_MS) return;
	lastSkipLog.set(path, now);
	console.error('[POISON-SKIP] path=' + path + ' (quarantined)');
}

/**
 * Reads via readFn behind full poison protection.
 * @param {string} path Record path (quarantine key + log label).
 * @param {() => (any|Promise<any>)} readFn Sync or async reader.
 * @param {object} [opts]
 * @param {any} [opts.fallback] Returned on any failure (default null).
 * @param {(value:any) => boolean} [opts.validate] Shape check; a
 *   false verdict counts as SHAPE poison.
 * @param {string} [opts.tag] Extra label for the journal line.
 * @returns {Promise<any>} The value, or the fallback. Never rejects.
 */
async function safeRecordRead(path, readFn, opts = {}) {
	const fallback = ('fallback' in opts) ? opts.fallback : null;
	try {
		if (await isQuarantined(path)) {
			logSkip(path);
			return fallback;
		}
	} catch (_) { /* quarantine check itself must never block a read */ }
	let value;
	try {
		value = await readFn();
	} catch (err) {
		const code = (err && (err.code || err.name)) || 'EUNKNOWN';
		if (code === 'ENOENT') return fallback;
		await notePoison(path, String(code));
		return fallback;
	}
	if (opts.validate) {
		let ok = false;
		try { ok = !!opts.validate(value); } catch (_) { ok = false; }
		if (!ok) {
			await notePoison(path, 'SHAPE');
			return fallback;
		}
	}
	return value;
}

module.exports = { safeRecordRead };
