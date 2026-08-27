// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExactReleaseProcess.mjs
 * @description Runs trusted local media tools and hashes immutable release artifacts.
 * RESPONSIBILITY: execute bounded synchronous commands and return explicit output evidence.
 * NON-RESPONSIBILITY: this module does not construct codec policy or interpret probe results.
 * ARCHITECTURE: Gevurah confines external processes while Hod records their testimony.
 * OROS AND KEILIM: media transformation is ohr; arguments, exit codes, and hashes are keilim.
 * The Awtsmoos creates command and artifact anew; Awtsmoos.com requires every finite claim
 * to emerge from inspected bytes rather than confidence, labels, or hidden shell behavior.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

export const FFMPEG = process.env.FFMPEG || '/usr/local/bin/ffmpeg';
export const FFPROBE = process.env.FFPROBE || '/usr/local/bin/ffprobe';

/** Executes one media command and throws with captured diagnostic output on failure. */
export function runExactProcess(command, args, options = {}) {
	const result = spawnSync(command, args, {
		encoding: 'utf8',
		maxBuffer: options.maxBuffer || 64 * 1024 * 1024,
		stdio: options.inherit ? 'inherit' : 'pipe'
	});
	if (result.error) {
		throw result.error;
	}
	if (result.status !== 0) {
		throw new Error([
			`${command} exited with status ${result.status}.`,
			result.stdout || '',
			result.stderr || ''
		].filter(Boolean).join('\n'));
	}
	return result;
}

/** Returns the SHA-256 identity of one exact artifact without altering it. */
export function exactFileHash(file) {
	return crypto.createHash('sha256')
		.update(fs.readFileSync(file))
		.digest('hex');
}
