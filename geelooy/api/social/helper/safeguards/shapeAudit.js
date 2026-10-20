//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module ShapeAudit
 * @description
 * Filesystem SHAPE audit (safeguards program, 2026-10-20).
 *
 * WHY THIS EXISTS: the 2026-10-20 site flap began as a shape lie —
 * `aliases/ikar-the-mittler-rebbe/postsSubmitted/inHeichel/ikar/
 * inSeries/torasChaim-...` was a DIRECTORY where every reader
 * expects a FILE. Readers trusted the shape; the lie cost the
 * site an EISDIR -> cache-bust -> 197 MB rescan cycle every ~2 min.
 *
 * This audit walks the native trees (rules in shapeAuditRules.js)
 * and reports every entry whose type mismatches what readers
 * expect, BEFORE a reader trips over it in production.
 *
 * RUN: nice -n 19 node shapeAudit.js
 * Writes one report section to state/shape-audit.log and prints a
 * summary. Bounded (MAX_ENTRIES) and yields between batches, so
 * even an un-niced run stays gentle on the 2 GB box.
 */

const fs = require('fs');
const path = require('path');
const { stateFile } = require('./safeguardState.js');
const { tick, listDir, auditAlias, auditHeichelPosts } =
	require('./shapeAuditRules.js');

/** @constant {string} Data root (native OS tree). */
const DATA_ROOT = process.env.AWTSMOOS_DATA_ROOT ||
	'/mnt/HC_Volume_102267213/dayuhChadash/social';
/** @constant {number} Hard cap on directory entries visited. */
const MAX_ENTRIES = 250000;

/**
 * Runs the audit, writes the report section, prints the summary.
 * @returns {Promise<void>}
 */
async function main() {
	const started = new Date().toISOString();
	const ctx = { visited: 0, bad: [], counts: { files: 0, dirs: 0 }, maxEntries: MAX_ENTRIES };
	for (const a of await listDir(path.join(DATA_ROOT, 'aliases'))) {
		if (a.isDirectory()) await auditAlias(path.join(DATA_ROOT, 'aliases', a.name), ctx);
		if (ctx.visited > MAX_ENTRIES) break;
		await tick();
	}
	for (const h of await listDir(path.join(DATA_ROOT, 'heichelos'))) {
		if (h.isDirectory()) await auditHeichelPosts(path.join(DATA_ROOT, 'heichelos', h.name), ctx);
		if (ctx.visited > MAX_ENTRIES) break;
	}
	const lines = [
		'=== shape-audit ' + started + ' visited=' + ctx.visited + ' ===',
		'RULE-A known-bad (dir where a file is expected): ' + ctx.bad.length,
		...ctx.bad.map((p) => 'MISMATCH\t' + p),
		'RULE-B heichelos posts children: files=' + ctx.counts.files + ' dirs=' + ctx.counts.dirs
	];
	try {
		await fs.promises.mkdir(path.dirname(stateFile('shape-audit.log')), { recursive: true });
		await fs.promises.appendFile(stateFile('shape-audit.log'), lines.join('\n') + '\n', 'utf8');
	} catch (err) { console.error('report write failed:', err.code || err); }
	console.log(lines[0]);
	console.log(lines[1]);
	console.log(lines[lines.length - 1]);
	console.log('Report: ' + stateFile('shape-audit.log'));
}

if (require.main === module) {
	main().catch((err) => {
		console.error('shape audit failed:', err);
		process.exitCode = 1;
	});
}

module.exports = { main };
