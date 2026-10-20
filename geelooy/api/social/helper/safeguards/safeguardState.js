//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module SafeguardState
 * @description
 * Shared storage primitives for the safeguards program (2026-10-20).
 *
 * WHY THIS EXISTS: safeguards must observe a fragile 2 GB server
 * without ever becoming a failure source themselves. Every write
 * here is an APPEND of one short text line to a log file in the
 * state dir — no JSON documents (user law: no JSON state files),
 * no read-modify-write cycles, no locks, and NO throw ever escapes:
 * a safeguard that fails logs once to stderr and goes quiet.
 *
 * STATE DIR: <dayuhChadash>/socialPacked/state on the production
 * volume, overridable with the AWTSMOOS_SAFEGUARD_STATE env var
 * (tests and local runs point it at a scratch dir).
 */

const fs = require('fs');
const path = require('path');

/** @constant {string} Production state dir on the data volume. */
const DEFAULT_STATE_DIR =
	'/mnt/HC_Volume_102267213/dayuhChadash/socialPacked/state';

/**
 * Absolute path of the safeguards state dir.
 * @returns {string}
 */
function stateDir() {
	return process.env.AWTSMOOS_SAFEGUARD_STATE || DEFAULT_STATE_DIR;
}

/**
 * Absolute path of one state log file.
 * @param {string} name Bare file name, e.g. 'poison-quarantine.log'.
 * @returns {string}
 */
function stateFile(name) {
	return path.join(stateDir(), name);
}

/** @type {Promise<void>|null} One shared dir-ensure, created lazily. */
let dirReady = null;

/**
 * Ensures the state dir exists (once per process, memoized).
 * @returns {Promise<void>} Resolves even on failure — see header.
 */
function ensureDir() {
	if (!dirReady) {
		dirReady = fs.promises
			.mkdir(stateDir(), { recursive: true })
			.then(() => undefined)
			.catch((err) => {
				console.error('[SAFEGUARD] state dir unavailable:', err.code || err);
			});
	}
	return dirReady;
}

/**
 * Appends ONE line to a state log. Fire-and-forget safe: the
 * returned promise never rejects.
 * @param {string} name State file name (see stateFile).
 * @param {string} line Single line, no trailing newline needed.
 * @returns {Promise<void>}
 */
async function appendLine(name, line) {
	try {
		await ensureDir();
		await fs.promises.appendFile(stateFile(name), line + '\n', 'utf8');
	} catch (err) {
		console.error('[SAFEGUARD] append failed:', name, err.code || err);
	}
}

/**
 * Reads a state log as trimmed non-empty lines.
 * @param {string} name State file name.
 * @returns {Promise<string[]>} Empty array when missing/unreadable.
 */
async function readLines(name) {
	try {
		const raw = await fs.promises.readFile(stateFile(name), 'utf8');
		return raw.split('\n').map((s) => s.trim()).filter(Boolean);
	} catch (_) {
		return [];
	}
}

module.exports = { stateDir, stateFile, appendLine, readLines };
