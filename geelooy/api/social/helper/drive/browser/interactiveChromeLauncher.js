//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Launches one private Chromium engine behind the guarded loopback proxy.
 * @description
 * Chrome starts with optional background services disabled so the user page owns the
 * critical renderer path. Readiness is proven by responsive DevTools, not a port file.
 */
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { waitForChromeReady } = require('./interactiveChromeReadiness.js');

const CANDIDATE_PATHS = [
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	'/Applications/Chromium.app/Contents/MacOS/Chromium',
	'/usr/bin/google-chrome',
	'/usr/bin/google-chrome-stable',
	'/usr/bin/chromium',
	'/usr/bin/chromium-browser'
];

/**
 * Starts an owned Chrome process and returns only after DevTools is responsive.
 * @param {{profilePath:string,proxyPort:number}} options Private profile and proxy port.
 * @returns {Promise<object>} Owned process testimony and close function.
 */
async function launchInteractiveChrome({ profilePath, proxyPort, engineMode }) {
	const executable = findChromeExecutable();
	if (!executable) {
		throw chromeError('INTERACTIVE_BROWSER_UNAVAILABLE', 503);
	}
	const activePortFile = path.join(profilePath, 'DevToolsActivePort');
	fs.rmSync(activePortFile, { force: true });
	const child = spawn(executable, chromeArguments(profilePath, proxyPort, engineMode), {
		detached: process.platform !== 'win32',
		stdio: 'ignore'
	});
	try {
		const debugPort = await waitForChromeReady(activePortFile, child);
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

/** Finds the configured or first supported local Chromium executable. */
function findChromeExecutable() {
	const configured = process.env.CHROME_PATH;
	if (configured && fs.existsSync(configured)) {
		return configured;
	}
	return CANDIDATE_PATHS.find(candidate => fs.existsSync(candidate)) || null;
}

/**
 * Builds a minimal browser profile that preserves user web capability while disabling
 * unrelated extension/update/background traffic from the critical CDP renderer path.
 */
function chromeArguments(profilePath, proxyPort, engineMode = 'headless') {
	const args = [
		'--remote-debugging-address=127.0.0.1',
		'--remote-debugging-port=0',
		`--user-data-dir=${profilePath}`,
		`--proxy-server=http://127.0.0.1:${proxyPort}`,
		'--proxy-bypass-list=<-loopback>',
		'--disable-background-networking',
		'--disable-component-update',
		'--disable-extensions',
		'--disable-quic',
		'--disable-sync',
		'--force-webrtc-ip-handling-policy=disable_non_proxied_udp',
		'--no-first-run',
		'--no-default-browser-check',
		'about:blank'
	];
	if (engineMode !== 'compatibility' && process.env.AWTSMOOS_BROWSER_HEADLESS !== '0') {
		args.unshift('--headless=new');
	}
	if (process.env.AWTSMOOS_BROWSER_ALLOW_NO_SANDBOX === '1') {
		args.unshift('--no-sandbox');
	}
	return args;
}

/** Stops only the owned Chrome process group created for this browser runtime. */
function stopChrome(child) {
	if (!child || child.exitCode != null) {
		return;
	}
	try {
		if (process.platform !== 'win32' && child.pid) {
			process.kill(-child.pid, 'SIGTERM');
		} else {
			child.kill('SIGTERM');
		}
	} catch {}
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
