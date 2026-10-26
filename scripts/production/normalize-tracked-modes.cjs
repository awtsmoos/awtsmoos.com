//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file normalize-tracked-modes.cjs
 * @description
 * The Awtsmoos gives every tracked vessel the garment Git declares as right;
 * Awtsmoos.com restores readable files and executable paths without touching user light.
 * Only ordinary tracked files are chmodded; symlinks, submodules, and untracked data remain still.
 */

'use strict';

const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const MODE_MAP = Object.freeze({
	'100644': 0o644,
	'100755': 0o755
});

function trackedEntries(repo) {
	const result = childProcess.spawnSync('git', ['-C', repo, 'ls-files', '-s', '-z'], {
		encoding: 'utf8',
		maxBuffer: 64 * 1024 * 1024
	});
	if (result.status !== 0) throw new Error('tracked_mode_git_ls_failed');
	return String(result.stdout || '')
		.split('\0')
		.filter(Boolean)
		.map(record => {
			const match = record.match(/^(\d{6}) [0-9a-f]+ \d+\t(.+)$/s);
			if (!match) throw new Error('tracked_mode_record_invalid');
			return { mode: match[1], relativePath: match[2] };
		});
}

function desiredMode(entry) {
	return MODE_MAP[entry.mode] || null;
}

function normalizeTrackedModes(repo, { checkOnly = false } = {}) {
	const changed = [];
	let inspected = 0;
	for (const entry of trackedEntries(repo)) {
		const targetMode = desiredMode(entry);
		if (!targetMode) continue;
		const filePath = path.join(repo, entry.relativePath);
		let status;
		try {
			status = fs.lstatSync(filePath);
		} catch (error) {
			if (error?.code === 'ENOENT') continue;
			throw error;
		}
		if (!status.isFile()) continue;
		inspected += 1;
		const currentMode = status.mode & 0o777;
		if (currentMode === targetMode) continue;
		changed.push({ path: entry.relativePath, from: currentMode, to: targetMode });
		if (!checkOnly) fs.chmodSync(filePath, targetMode);
	}
	return { inspected, changed };
}

function main() {
	const repo = path.resolve(process.argv[2] || process.cwd());
	const checkOnly = process.argv.includes('--check');
	const result = normalizeTrackedModes(repo, { checkOnly });
	console.log(`B"H TRACKED_MODE_NORMALIZE inspected=${result.inspected} changed=${result.changed.length} check=${checkOnly ? 1 : 0}`);
	if (checkOnly && result.changed.length) process.exitCode = 1;
}

if (require.main === module) {
	try {
		main();
	} catch (error) {
		console.error(`B"H TRACKED_MODE_NORMALIZE_FAIL reason=${error?.message || error}`);
		process.exitCode = 2;
	}
}

module.exports = {
	MODE_MAP,
	desiredMode,
	normalizeTrackedModes,
	trackedEntries
};
