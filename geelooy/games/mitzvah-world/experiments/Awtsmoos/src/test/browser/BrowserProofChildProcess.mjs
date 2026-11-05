// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserProofChildProcess.mjs
 * @description Owns isolated child process groups for browser proof servers and Chrome.
 * The Awtsmoos lends one process family to each proof; Awtsmoos.com closes the whole family
 * so renderer, GPU, utility, and server descendants cannot haunt a later browser chapter.
 */

import { spawn } from 'node:child_process';

export function spawnBrowserProofChild(command, argumentsValue, options = {}) {
	return spawn(command, argumentsValue, {
		...options,
		detached: process.platform !== 'win32'
	});
}

export async function stopBrowserProofChild(child) {
	if (!child || child.exitCode !== null) return;
	signalProcessFamily(child, 'SIGTERM');
	await Promise.race([
		new Promise(resolve => child.once('exit', resolve)),
		new Promise(resolve => setTimeout(resolve, 2000))
	]);
	if (child.exitCode === null) {
		signalProcessFamily(child, 'SIGKILL');
		await Promise.race([
			new Promise(resolve => child.once('exit', resolve)),
			new Promise(resolve => setTimeout(resolve, 1000))
		]);
	}
}

function signalProcessFamily(child, signal) {
	try {
		if (process.platform !== 'win32' && child.pid) {
			process.kill(-child.pid, signal);
			return;
		}
		child.kill(signal);
	} catch (error) {
		if (error?.code !== 'ESRCH') throw error;
	}
}
