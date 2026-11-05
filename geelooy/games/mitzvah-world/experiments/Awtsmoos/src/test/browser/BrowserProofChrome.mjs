// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserProofChrome.mjs
 * @description Starts isolated Chrome with bounded fresh-port and fresh-profile retries.
 * The Awtsmoos does not confuse one failed vessel with the whole road; Awtsmoos.com releases each
 * silent attempt completely, then opens another measured doorway without leaving renderer shadows.
 */

import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnBrowserProofChild, stopBrowserProofChild } from './BrowserProofChildProcess.mjs';
import { freeBrowserProofPort, waitForBrowserProofUrl } from './BrowserProofLifecycle.mjs';
import { captureBrowserProofOutput } from './BrowserProofOutput.mjs';

const DEFAULT_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ATTEMPT_COUNT = 3;
const ATTEMPT_TIMEOUT_MS = 30000;

export function browserProofAvailable() {
	return existsSync(chromeExecutable());
}

export async function startBrowserProofChrome() {
	const evidence = [];
	for (let attempt = 1; attempt <= ATTEMPT_COUNT; attempt += 1) {
		const cdpPort = await freeBrowserProofPort();
		const profile = await mkdtemp(path.join(os.tmpdir(), 'mitzvah-browser-proof-'));
		const chrome = spawnBrowserProofChild(
			chromeExecutable(),
			chromeArguments(profile, cdpPort),
			{ stdio: ['ignore', 'pipe', 'pipe'] }
		);
		const output = captureBrowserProofOutput(chrome);
		try {
			await waitForBrowserProofUrl(
				`http://127.0.0.1:${cdpPort}/json/version`,
				chrome,
				ATTEMPT_TIMEOUT_MS
			);
			return { cdpPort, chrome, profile };
		} catch (error) {
			evidence.push(attemptEvidence(attempt, error, output()));
			await stopBrowserProofChild(chrome);
			await rm(profile, { force: true, recursive: true });
			if (attempt < ATTEMPT_COUNT) await delay(250);
		}
	}
	throw new Error(`CHROME_START_FAILED\n\n${evidence.join('\n\n')}`);
}

function chromeArguments(profile, cdpPort) {
	const values = [
		`--remote-debugging-address=127.0.0.1`,
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
		'--disable-extensions',
		'--disable-sync',
		'--no-default-browser-check',
		'--no-first-run',
		'--window-position=40,40',
		'--window-size=1280,800',
		'about:blank'
	];
	if (process.env.AWTSMOOS_HEADFUL_PROOF !== '1') values.unshift('--headless=new');
	return values;
}

function attemptEvidence(attempt, error, output) {
	return [
		`ATTEMPT_${attempt}: ${error?.message || error}`,
		output ? `CHROME_OUTPUT_${attempt}\n${output}` : ''
	].filter(Boolean).join('\n');
}

function chromeExecutable() {
	return process.env.AWTSMOOS_CHROME_EXECUTABLE || DEFAULT_CHROME;
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
