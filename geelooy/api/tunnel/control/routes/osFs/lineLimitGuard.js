//B"H
//Blessed is He
//Boruch Hashem
/** @module LineLimitGuard - tunnel-level coding-law enforcement. */
/**
 * BLOCKS on write: files over 120 lines; .js without the exact B"H header;
 * sustained space indentation (tabs required); minified-looking long lines.
 * AI SAFEGUARD: never weaken these checks without the user explicit order.
 * Comply with the standard instead of bypassing the guard.
 */
const MAX_LINES = 120;
const MAX_LINE_CHARS = 500;
const INDENT_BLOCK_THRESHOLD = 10;
const EXPECTED_HEADER = ['//B"H', '//Blessed is He', '//Boruch Hashem'];
/** Counts lines in file content. @param {string} content @returns {number} */
function countLines(content) {
	const s = String(content ?? '');
	if (!s) return 1;
	return s.split('\n').length;
}
/** Blocks content longer than MAX_LINES. */
function checkLineCount(filePath, text) {
	const lines = countLines(text);
	if (lines <= MAX_LINES) return null;
	return { ok: false, error: 'FILE_TOO_LONG_BLOCKED', path: filePath,
		lines: lines, maxLines: MAX_LINES,
		message: 'BLOCKED: files may never exceed ' + MAX_LINES + ' lines (' + lines +
			' given). FIX: split into modules under ' + MAX_LINES + ' lines each, ' +
			'each with its own B"H header and JSDoc, then write them one at a time.' };
}
/** Blocks .js whose first three lines are not exactly the B"H header. */
function checkHeader(filePath, text) {
	const first = text.split('\n').slice(0, 3);
	for (let i = 0; i < 3; i++) {
		const got = (first[i] || "").replace(/\r$/, "");
		if (got !== EXPECTED_HEADER[i]) return { ok: false, error: 'BAD_HEADER_BLOCKED', path: filePath,
			message: 'BLOCKED: the first three lines of every .js file must be exactly ' +
				EXPECTED_HEADER.join(' | ') + '. ' +
				'FIX: put those three lines at the very top, before any code or blank lines.' };
	}
	return null;
}
/** Blocks sustained space indentation; warns on a few stray lines. */
function checkIndentation(filePath, text) {
	const bad = [];
	const parts = text.split('\n');
	for (let i = 0; i < parts.length; i++) {
		const t = parts[i].trim();
		if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*") || !t) continue;
		if (/^ +\S/.test(parts[i])) bad.push(i + 1);
	}
	if (bad.length > INDENT_BLOCK_THRESHOLD) return { ok: false, error: 'BAD_INDENT_BLOCKED', path: filePath,
		message: 'BLOCKED: tab indentation required; ' + bad.length + ' space-indented lines ' +
			'(e.g. lines ' + bad.slice(0, 5).join(', ') + '). FIX: replace leading spaces with tabs.' };
	if (bad.length) console.warn('[lineLimitGuard] WARN: ' + bad.length + ' space-indented line(s) in ' + filePath + ' (lines ' + bad.join(', ') + ').');
	return null;
}
/** Blocks minified-looking lines: very long single lines of dense code. */
function checkMinified(filePath, text) {
	const parts = text.split('\n');
	for (let i = 0; i < parts.length; i++) {
		const line = parts[i];
		if (line.length <= MAX_LINE_CHARS) continue;
		const t = line.trim();
		if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) continue;
		if (/;.*[{}]/.test(t) || /=>/.test(t)) return { ok: false, error: 'MINIFIED_BLOCKED', path: filePath,
			message: 'BLOCKED: line ' + (i + 1) + ' looks minified (' + line.length + ' chars). ' +
			'FIX: expand it into readable, normally-indented lines. No compressed code, ever.' };
	}
	return null;
}
/** Sync fs calls banned in NEW code under geelooy/api (see checkSyncIo). */
const SYNC_IO_PATTERN = /\b(readFileSync|writeFileSync|readdirSync|statSync|existsSync|openSync|readSync|writeSync|closeSync|appendFileSync|mkdirSync|lstatSync|realpathSync|copyFileSync)\s*\(/;
/** True when a written path lives under geelooy/api (relative or absolute). */
function isApiPath(filePath) {
	const p = String(filePath || '').replace(/\\/g, '/');
	return /(^|\/)geelooy\/api\//.test(p);
}
/** The guard's own source names the banned calls; it is exempt by name. */
function isGuardSelf(filePath) {
	return /lineLimitGuard\.js$/.test(String(filePath || ''));
}
/** Test files legitimately read fixtures synchronously; exempt by name. */
function isTestPath(filePath) {
	return /\.(test|spec)\./.test(String(filePath || '')) || /\/test\//.test(String(filePath || ''));
}
/**
 * BLOCKS new synchronous I/O under geelooy/api (safeguards phase 3,
 * 2026-10-20): one sync fs call freezes the single event loop for
 * EVERY request — the flap's root mechanism. Existing offenders are
 * warn-listed in SYNC_IO_WARNLIST.md (same folder), not grandfathered
 * for new writes. FIX: use fs.promises / async fs APIs.
 */
function checkSyncIo(filePath, text) {
	if (!isApiPath(filePath) || isGuardSelf(filePath) || isTestPath(filePath)) return null;
	const m = SYNC_IO_PATTERN.exec(text);
	if (!m) return null;
	return { ok: false, error: 'SYNC_IO_BLOCKED', path: filePath,
		message: 'BLOCKED: synchronous I/O (' + m[1] + ') is banned in new code under geelooy/api - ' +
			'it freezes the single event loop for every request. ' +
			'FIX: use fs.promises or another async fs API instead.' };
}
/** Line-count check, kept for backwards compatibility with callers. */
function checkLineLimit(filePath, content) {
	if (typeof content !== 'string') return null;
	return checkLineCount(filePath, content);
}
/** Runs every file standard check. .js-only checks are skipped otherwise. */
function checkFileStandards(filePath, content) {
	if (typeof content !== 'string') return null;
	const over = checkLineCount(filePath, content);
	if (over) return over;
	if (!/\.js$/i.test(String(filePath || ''))) return null;
	return checkHeader(filePath, content) || checkIndentation(filePath, content) || checkMinified(filePath, content) || checkSyncIo(filePath, content) || null;
}
module.exports = { MAX_LINES: MAX_LINES, countLines: countLines, checkLineLimit: checkLineLimit, checkFileStandards: checkFileStandards, checkSyncIo: checkSyncIo };
