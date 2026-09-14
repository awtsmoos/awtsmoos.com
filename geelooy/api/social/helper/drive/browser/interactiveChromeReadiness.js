//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Proves Chromium DevTools is actually responsive before a session may use it.
 * @description
 * A DevToolsActivePort file is only a hint. Awtsmoos waits for the local JSON endpoint
 * itself so renderer work never races Chrome's half-awake startup boundary.
 */

const fs = require('node:fs');
const http = require('node:http');

const STARTUP_TIMEOUT_MS = 15000;
const PROBE_TIMEOUT_MS = 500;

/**
 * Waits until Chrome is alive, publishes a valid port, and answers `/json/version`.
 * @param {string} activePortFile Chrome's private DevToolsActivePort path.
 * @param {import('node:child_process').ChildProcess} child Owned Chrome process.
 * @param {(port:number)=>Promise<boolean>} probe Injectable readiness probe for tests.
 * @returns {Promise<number>} Responsive loopback DevTools port.
 */
async function waitForChromeReady(activePortFile, child, probe = probeDevtools) {
	const deadline = Date.now() + STARTUP_TIMEOUT_MS;
	while (Date.now() < deadline) {
		if (child.exitCode != null) {
			throw readinessError('INTERACTIVE_BROWSER_EXITED', 503);
		}
		const port = readDebugPort(activePortFile);
		if (port && await safeProbe(probe, port)) {
			return port;
		}
		await delay(100);
	}
	throw readinessError('INTERACTIVE_BROWSER_STARTUP_TIMEOUT', 503);
}
/** Reads the current DevTools port without treating malformed startup state as ready. */
function readDebugPort(activePortFile) {
	try {
		const firstLine = fs.readFileSync(activePortFile, 'utf8').split(/\r?\n/)[0];
		const port = Number(firstLine);
		return Number.isInteger(port) && port > 0 ? port : null;
	} catch {
		return null;
	}
}

/** Probes the loopback DevTools version endpoint with a deliberately short timeout. */
function probeDevtools(port) {
	return new Promise(resolve => {
		const request = http.get({
			host: '127.0.0.1',
			path: '/json/version',
			port,
			timeout: PROBE_TIMEOUT_MS
		}, response => {
			let text = '';
			response.on('data', chunk => text += chunk);
			response.on('end', () => resolve(validVersion(response.statusCode, text)));
		});
		request.on('timeout', () => request.destroy());
		request.on('error', () => resolve(false));
	});
}
/** Accepts only a successful JSON response exposing Chrome's browser identity. */
function validVersion(statusCode, text) {
	if (statusCode !== 200) {
		return false;
	}
	try {
		const value = JSON.parse(text);
		return Boolean(value?.Browser && value?.webSocketDebuggerUrl);
	} catch {
		return false;
	}
}

/** Converts probe failures into a simple false readiness result. */
async function safeProbe(probe, port) {
	try {
		return Boolean(await probe(port));
	} catch {
		return false;
	}
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function readinessError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	probeDevtools,
	readDebugPort,
	waitForChromeReady
};
