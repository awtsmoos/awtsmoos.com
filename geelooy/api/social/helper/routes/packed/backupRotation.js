//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module BackupRotation
 * @description Enforces backup hygiene for shard snapshot files.
 * The disaster this prevents: 11 pre-migration `.bak` snapshots
 * (9.19 GB, Oct 6–7) sat in the live `socialPacked/` directory for
 * two weeks because nothing ever expired them (db-investigation 03).
 * Policy, per shard base name:
 *  - keep at most MAX_KEEP (3) newest snapshots;
 *  - delete any snapshot older than MAX_AGE_MS (14 days);
 *  - ALWAYS keep the single newest snapshot of each shard, even if
 *    it is older than the max age — a lone backup is still a backup.
 * Runnable two ways: as a module (`rotateBackups(dir)`) and as a
 * CLI (`node backupRotation.js <dir>`) for a systemd timer. Every
 * deletion is printed (journal-visible) and returned to the caller.
 * It only ever touches files whose names end in `.bak`.
 */

const fs = require('fs');
const path = require('path');
/** Snapshots older than this are expired. */
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
/** Newest snapshots kept per shard base name. */
const MAX_KEEP = 3;

/**
 * Groups `.bak` files in a directory by shard base name.
 * `social.heichel.ikar.posts.fs.awtsdb.<tag>.bak` groups under
 * `social.heichel.ikar.posts.fs.awtsdb`.
 * @param {string} dir - directory to scan (non-recursive).
 * @returns {Map<string, Array<{file: string, mtimeMs: number, size: number}>>}
 */
function groupBackups(dir) {
	const groups = new Map();
	let names = [];
	try { names = fs.readdirSync(dir); } catch (_) { return groups; }
	for (const name of names) {
		if (!name.endsWith('.bak') || !name.includes('.awtsdb.')) continue;
		const full = path.join(dir, name);
		let st;
		try { st = fs.statSync(full); } catch (_) { continue; }
		if (!st.isFile()) continue;
		const base = name.slice(0, name.indexOf('.awtsdb.') + '.awtsdb'.length);
		if (!groups.has(base)) groups.set(base, []);
		groups.get(base).push({ file: full, mtimeMs: st.mtimeMs, size: st.size });
	}
	for (const list of groups.values()) {
		list.sort((a, b) => b.mtimeMs - a.mtimeMs);
	}
	return groups;
}

/**
 * Applies the rotation policy to every `.bak` group in a directory.
 * @param {string} dir - directory holding shard snapshots.
 * @param {object} [opts] - { maxAgeMs, maxKeep, dryRun, now }.
 * @returns {object} { deleted: [{file, size}], kept, freedBytes }.
 */
function rotateBackups(dir, opts = {}) {
	const maxAgeMs = Number(opts.maxAgeMs) > 0 ? Number(opts.maxAgeMs) : MAX_AGE_MS;
	const maxKeep = Number.isInteger(opts.maxKeep) ? opts.maxKeep : MAX_KEEP;
	const now = Number(opts.now) > 0 ? Number(opts.now) : Date.now();
	const deleted = [];
	let kept = 0;
	let freedBytes = 0;
	for (const [base, list] of groupBackups(dir)) {
		list.forEach((entry, rank) => {
			const tooOld = now - entry.mtimeMs > maxAgeMs;
			const tooMany = rank >= maxKeep;
			const isNewest = rank === 0;
			if (isNewest || (!tooOld && !tooMany)) { kept++; return; }
			if (!opts.dryRun) {
				try { fs.unlinkSync(entry.file); } catch (_) { kept++; return; }
			}
			deleted.push({ file: entry.file, size: entry.size });
			freedBytes += entry.size;
			console.log(`B"H [BACKUP-ROTATION] expired ${entry.file} (${base})`);
		});
	}
	return { deleted, kept, freedBytes };
}

module.exports = { MAX_AGE_MS, MAX_KEEP, groupBackups, rotateBackups };

if (require.main === module) {
	const dir = process.argv[2];
	if (!dir) {
		console.error('usage: node backupRotation.js <socialPacked-dir>');
		process.exit(2);
	}
	const result = rotateBackups(dir, { dryRun: process.argv.includes('--dry-run') });
	console.log(`B"H [BACKUP-ROTATION] done: deleted=${result.deleted.length} kept=${result.kept} freedBytes=${result.freedBytes}`);
}
