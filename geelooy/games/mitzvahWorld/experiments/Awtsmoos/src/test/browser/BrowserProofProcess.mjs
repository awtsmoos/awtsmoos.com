// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserProofProcess.mjs
 * @description Owns one temporary server and one complete isolated Chrome process family.
 * The Awtsmoos opens a measured doorway and closes every borrowed vessel; Awtsmoos.com
 * keeps ports, profiles, renderer descendants, and server children outside later test chapters.
 */

import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import {
	spawnBrowserProofChild,
	stopBrowserProofChild
} from './BrowserProofChildProcess.mjs';

const DEFAULT_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

export function browserProofAvailable() {
	return existsSync(chromeExecutable());
}

export async function startBrowserProof(repositoryRoot) {
	const httpPort = await freePort();
	const cdpPort = await freePort();
	const profile = await mkdtemp(path.join(os.tmpdir(), 'mitzvah-browser-proof-'));
	const server = spawnBrowserProofChild('python3', [
		'-m', 'http.server', String(httpPort),
		'--bind', '127.0.0.1', '--directory', repositoryRoot
	], { stdio: 'ignore' });
	const baseUrl = `http://127.0.0.1:${httpPort}`;
	await waitForUrl(baseUrl, server);
	const chrome = spawnBrowserProofChild(chromeExecutable(), [
		'--headless=new',
		`--remote-debugging-port=${cdpPort}`,
		`--user-data-dir=${profile}`,
		'--use-gl=swiftshader',
		'--enable-webgl',
		'--ignore-gpu-blocklist',
		'--disable-background-networking',
		'--disable-background-timer-throttling',
		'--disable-renderer-backgrounding',
		'--disable-backgrounding-occluded-windows',
		'--disable-features=CalculateNativeWinOcclusion',
		'--disable-component-update',
		'--no-first-run',
		'--window-size=1280,800',
		'about:blank'
	], { stdio: 'ignore' });
	await waitForUrl(`http://127.0.0.1:${cdpPort}/json/version`, chrome);
	return {
		baseUrl,
		cdpPort,
		async stop() {
			await stopBrowserProofChild(chrome);
			await stopBrowserProofChild(server);
			await rm(profile, { force: true, recursive: true });
		}
	};
}

function chromeExecutable() {
	return process.env.AWTSMOOS_CHROME_EXECUTABLE || DEFAULT_CHROME;
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

async function waitForUrl(url, processValue) {
	const deadline = Date.now() + 10000;
	while (Date.now() < deadline) {
		if (processValue.exitCode !== null) throw new Error(`PROCESS_EXITED ${url}`);
		try {
			const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
			if (response.ok) return;
		} catch {}
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	throw new Error(`URL_TIMEOUT ${url}`);
}
