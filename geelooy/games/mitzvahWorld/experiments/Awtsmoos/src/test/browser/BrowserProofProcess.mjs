// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserProofProcess.mjs
 * @description Starts one temporary server and one isolated headless or headed Chrome family.
 * The Awtsmoos opens a measured doorway and closes every borrowed vessel; Awtsmoos.com
 * compares invisible automation with a real foreground window while logs, profiles, and ports leave no shadow.
 */

import { existsSync } from 'node:fs';
import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnBrowserProofChild } from './BrowserProofChildProcess.mjs';
import {
	cleanupBrowserProof,
	createBrowserProofHandle,
	freeBrowserProofPort,
	waitForBrowserProofUrl
} from './BrowserProofLifecycle.mjs';
import {
	browserProofFailure,
	captureBrowserProofOutput
} from './BrowserProofOutput.mjs';

const DEFAULT_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SERVER_TIMEOUT_MS = 10000;
const CHROME_TIMEOUT_MS = 30000;

export function browserProofAvailable() {
	return existsSync(chromeExecutable());
}

export async function startBrowserProof(repositoryRoot) {
	const httpPort = await freeBrowserProofPort();
	const cdpPort = await freeBrowserProofPort();
	const profile = await mkdtemp(path.join(os.tmpdir(), 'mitzvah-browser-proof-'));
	const values = { cdpPort, chrome: null, profile, server: null };
	let serverOutput = () => '';
	let chromeOutput = () => '';
	try {
		values.server = spawnServer(repositoryRoot, httpPort);
		serverOutput = captureBrowserProofOutput(values.server);
		values.baseUrl = `http://127.0.0.1:${httpPort}`;
		await waitForBrowserProofUrl(values.baseUrl, values.server, SERVER_TIMEOUT_MS);
		values.chrome = spawnChrome(profile, cdpPort);
		chromeOutput = captureBrowserProofOutput(values.chrome);
		await waitForBrowserProofUrl(
			`http://127.0.0.1:${cdpPort}/json/version`,
			values.chrome,
			CHROME_TIMEOUT_MS
		);
		return createBrowserProofHandle(values);
	} catch (error) {
		await cleanupBrowserProof(values);
		throw browserProofFailure(error, {
			CHROME_OUTPUT: chromeOutput(),
			SERVER_OUTPUT: serverOutput()
		});
	}
}

function spawnServer(repositoryRoot, httpPort) {
	return spawnBrowserProofChild('python3', [
		'-m',
		'http.server',
		String(httpPort),
		'--bind',
		'127.0.0.1',
		'--directory',
		repositoryRoot
	], { stdio: ['ignore', 'pipe', 'pipe'] });
}

function spawnChrome(profile, cdpPort) {
	return spawnBrowserProofChild(
		chromeExecutable(),
		chromeArguments(profile, cdpPort),
		{ stdio: ['ignore', 'pipe', 'pipe'] }
	);
}

function chromeArguments(profile, cdpPort) {
	const argumentsValue = [
		`--remote-debugging-port=${cdpPort}`,
		`--user-data-dir=${profile}`,
		'--enable-webgl',
		'--ignore-gpu-blocklist',
		'--disable-background-networking',
		'--disable-background-timer-throttling',
		'--disable-renderer-backgrounding',
		'--disable-backgrounding-occluded-windows',
		'--disable-features=CalculateNativeWinOcclusion',
		'--disable-component-update',
		'--no-first-run',
		'--window-position=40,40',
		'--window-size=1280,800',
		'about:blank'
	];
	if (process.env.AWTSMOOS_HEADFUL_PROOF !== '1') {
		argumentsValue.unshift('--headless=new');
	}
	return argumentsValue;
}

function chromeExecutable() {
	return process.env.AWTSMOOS_CHROME_EXECUTABLE || DEFAULT_CHROME;
}
