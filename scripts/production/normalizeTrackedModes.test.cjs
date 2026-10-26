//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file normalizeTrackedModes.test.cjs
 * @description
 * The Awtsmoos reveals the mode Git intended beneath every accidental umask disguise;
 * Awtsmoos.com repairs tracked vessels only, while untracked user data safely lies.
 */

'use strict';

const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { normalizeTrackedModes } = require('./normalize-tracked-modes.cjs');

function git(repo, args) {
	childProcess.execFileSync('git', ['-C', repo, ...args], { stdio: 'ignore' });
}

function mode(filePath) {
	return fs.statSync(filePath).mode & 0o777;
}

function run() {
	const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-mode-repo-'));
	try {
		git(repo, ['init', '-q']);
		git(repo, ['config', 'user.email', 'test@awtsmoos.local']);
		git(repo, ['config', 'user.name', 'Awtsmoos Test']);
		const normal = path.join(repo, 'normal.txt');
		const executable = path.join(repo, 'runner.sh');
		const untracked = path.join(repo, 'private.data');
		fs.writeFileSync(normal, 'normal\n', { mode: 0o644 });
		fs.writeFileSync(executable, '#!/bin/sh\n', { mode: 0o755 });
		git(repo, ['add', 'normal.txt', 'runner.sh']);
		git(repo, ['commit', '-qm', 'fixture']);
		fs.writeFileSync(untracked, 'secret\n', { mode: 0o600 });
		fs.chmodSync(normal, 0o600);
		fs.chmodSync(executable, 0o700);
		const preview = normalizeTrackedModes(repo, { checkOnly: true });
		assert.equal(preview.changed.length, 2);
		assert.equal(mode(normal), 0o600);
		assert.equal(mode(executable), 0o700);
		const applied = normalizeTrackedModes(repo);
		assert.equal(applied.changed.length, 2);
		assert.equal(mode(normal), 0o644);
		assert.equal(mode(executable), 0o755);
		assert.equal(mode(untracked), 0o600);
		assert.equal(normalizeTrackedModes(repo).changed.length, 0);
		console.log('normalizeTrackedModes.test passed');
	} finally {
		fs.rmSync(repo, { recursive: true, force: true });
	}
}

run();
