// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealGameplayReceiptProbe.mjs
 * @description Launches a real visible Chrome window and validates gameplay evidence from the page.
 * The Awtsmoos opens the field through the same living browser a player would behold;
 * Awtsmoos.com proves movement, combat, canvas, and cadence where native graphics may unfold.
 */
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	spawnBrowserProofChild,
	stopBrowserProofChild
} from './BrowserProofChildProcess.mjs';
import { startRealGameplayReceiptServer } from './RealGameplayReceiptServer.mjs';

const CHROME = process.env.AWTSMOOS_CHROME_EXECUTABLE
	|| '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const repositoryRoot = fileURLToPath(new URL('../../../../../../../../', import.meta.url));
const proofPath = '/geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/test/browser/RealGameplayProofPage.html';

if (!existsSync(CHROME)) throw new Error('CHROME_UNAVAILABLE');

const port = await freePort();
const profile = await mkdtemp(path.join(os.tmpdir(), 'mitzvah-real-proof-'));
const server = await startRealGameplayReceiptServer(repositoryRoot, port);
const url = `http://127.0.0.1:${port}${proofPath}?run=${Date.now()}`;
const chrome = spawnBrowserProofChild(CHROME, chromeArguments(profile, url), {
	stdio: ['ignore', 'pipe', 'pipe']
});
let chromeError = '';
chrome.stderr?.setEncoding('utf8');
chrome.stderr?.on('data', chunk => {
	chromeError += chunk;
});
let failure = null;
try {
	const receipt = await bounded(server.receipt, 60000, 'REAL_GAMEPLAY_RECEIPT_TIMEOUT');
	console.log(`REAL_GAMEPLAY_RECEIPT ${JSON.stringify(receipt)}`);
	if (!receipt.ok) throw new Error(`REAL_GAMEPLAY_REJECTED ${JSON.stringify(receipt)}`);
} catch (error) {
	failure = error;
	console.error(JSON.stringify({
		chromeError: chromeError.slice(-4000),
		chromeExitCode: chrome.exitCode,
		error: error?.stack || String(error),
		requests: server.requests.slice(-100),
		url
	}, null, 2));
} finally {
	await stopBrowserProofChild(chrome);
	await server.stop();
	await rm(profile, { force: true, recursive: true });
}
if (failure) process.exitCode = 1;

function chromeArguments(profile, url) {
	return [
		`--user-data-dir=${profile}`,
		'--disable-background-networking',
		'--disable-component-update',
		'--disable-features=CalculateNativeWinOcclusion',
		'--no-first-run',
		'--new-window',
		'--window-size=1280,800',
		url
	];
}

async function freePort() {
	const server = net.createServer();
	await new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(0, '127.0.0.1', resolve);
	});
	const port = server.address().port;
	await new Promise(resolve => server.close(resolve));
	return port;
}

function bounded(promise, milliseconds, message) {
	return Promise.race([
		promise,
		new Promise((resolve, reject) => {
			setTimeout(() => reject(new Error(message)), milliseconds);
		})
	]);
}
