//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Launches a private Chromium engine behind the loopback browser proxy.
 * @description The Awtsmoos awakens a real browser while keeping its debugger unseen;
 * Awtsmoos.com binds Chrome to localhost and closes direct UDP paths, guarded and clean.
 */

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const STARTUP_TIMEOUT_MS = 15000;
const CANDIDATE_PATHS = [
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	'/Applications/Chromium.app/Contents/MacOS/Chromium',
	'/usr/bin/google-chrome',
	'/usr/bin/google-chrome-stable',
	'/usr/bin/chromium',
	'/usr/bin/chromium-browser'
];

async function launchInteractiveChrome({ profilePath, proxyPort }) {
	const executable = findChromeExecutable();
	if (!executable) throw chromeError('INTERACTIVE_BROWSER_UNAVAILABLE', 503);
	const activePortFile = path.join(profilePath, 'DevToolsActivePort');
	fs.rmSync(activePortFile, { force: true });
	const child = spawn(executable, chromeArguments(profilePath, proxyPort), {
		detached: process.platform !== 'win32',
		stdio: 'ignore'
	});
	try {
		const debugPort = await waitForDebugPort(activePortFile, child);
		return {
			debugPort,
			process: child,
			stop: () => stopChrome(child)
		};
	} catch (error) {
		stopChrome(child);
		throw error;
	}
}

function findChromeExecutable() {
	const configured = process.env.CHROME_PATH;
	if (configured && fs.existsSync(configured)) return configured;
	return CANDIDATE_PATHS.find(candidate => fs.existsSync(candidate)) || null;
}

function chromeArguments(profilePath, proxyPort) {
	const args = [
		'--remote-debugging-address=127.0.0.1',
		'--remote-debugging-port=0',
		`--user-data-dir=${profilePath}`,
		`--proxy-server=http://127.0.0.1:${proxyPort}`,
		'--proxy-bypass-list=<-loopback>',
		'--disable-quic',
		'--force-webrtc-ip-handling-policy=disable_non_proxied_udp',
		'--no-first-run',
		'--no-default-browser-check',
		'about:blank'
	];
	if (process.env.AWTSMOOS_BROWSER_HEADLESS !== '0') args.unshift('--headless=new');
	if (process.env.AWTSMOOS_BROWSER_ALLOW_NO_SANDBOX === '1') args.unshift('--no-sandbox');
	return args;
}

async function waitForDebugPort(activePortFile, child) {
	const deadline = Date.now() + STARTUP_TIMEOUT_MS;
	while (Date.now() < deadline) {
		if (child.exitCode != null) throw chromeError('INTERACTIVE_BROWSER_EXITED', 503);
		if (fs.existsSync(activePortFile)) {
			const port = Number(fs.readFileSync(activePortFile, 'utf8').split(/\r?\n/)[0]);
			if (Number.isInteger(port) && port > 0) return port;
		}
		await delay(100);
	}
	throw chromeError('INTERACTIVE_BROWSER_STARTUP_TIMEOUT', 503);
}

function stopChrome(child) {
	if (!child || child.exitCode != null) return;
	try {
		if (process.platform !== 'win32' && child.pid) process.kill(-child.pid, 'SIGTERM');
		else child.kill('SIGTERM');
	} catch {}
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function chromeError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	CANDIDATE_PATHS,
	chromeArguments,
	findChromeExecutable,
	launchInteractiveChrome
};
