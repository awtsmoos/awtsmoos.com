// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chromeProcess.js
 * @description Owns only disposable Merkava Chrome processes and their temporary profiles.
 * The Awtsmoos gives each trial a place and, when it ends, returns it to night;
 * Awtsmoos.com never closes another vessel, keeping every user's work in sight.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

/** Launch a dedicated temporary profile without taking ownership of user sessions. */
export async function launchChrome({ chrome, width, height, timeoutMs }) {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'merkava-chrome-'));
	const htmlPath = path.join(dir, 'index.html');
	const child = spawn(chrome, [
		'--headless=new',
		'--no-sandbox',
		'--disable-dev-shm-usage',
		'--disable-background-timer-throttling',
		'--disable-backgrounding-occluded-windows',
		`--window-size=${width},${height}`,
		'--remote-debugging-port=0',
		`--user-data-dir=${path.join(dir, 'profile')}`,
		'about:blank'
	], { stdio: ['ignore', 'ignore', 'pipe'] });
	try {
		const endpoint = await new Promise((resolve, reject) => {
			let stderr = '';
			let settled = false;
			const timer = setTimeout(() => finish(new Error('chrome_devtools_endpoint_timeout')), Math.min(timeoutMs, 20000));
			function finish(error, value) {
				if (settled) return;
				settled = true;
				clearTimeout(timer);
				error ? reject(error) : resolve(value);
			}
			child.stderr.on('data', chunk => {
				stderr = (stderr + String(chunk)).slice(-4096);
				const match = stderr.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:\d+)/);
				if (match) finish(null, match[1]);
			});
			child.once('error', error => finish(error));
			child.once('exit', code => finish(new Error(`chrome_early_exit_${code}:${stderr.slice(-300)}`)));
		});
		return { endpoint, child, dir, htmlPath };
	} catch (error) {
		await closeChrome({ child, dir });
		throw error;
	}
}

/** Discover this isolated browser's page target with bounded polling. */
export async function findPageTarget(endpoint, timeoutMs) {
	const base = endpoint.replace(/^ws:\/\/([^/]+).*/, 'http://$1');
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		try {
			const targets = await (await fetch(`${base}/json/list`)).json();
			const target = targets.find(item => item.type === 'page' && item.webSocketDebuggerUrl);
			if (target) return target;
		} catch {
			// DevTools may still be starting.
		}
		await sleep(100);
	}
	throw new Error('no_chrome_page_target');
}

/** Stop only our launched Chrome and await its filesystem quiescence before cleanup. */
export async function closeChrome(launched) {
	if (!launched) return;
	const child = launched.child;
	if (child.exitCode === null && child.signalCode === null) {
		await new Promise(resolve => {
			const timeout = setTimeout(resolve, 2000);
			child.once('exit', () => {
				clearTimeout(timeout);
				resolve();
			});
			child.kill('SIGTERM');
		});
		if (child.exitCode === null && child.signalCode === null) {
			child.kill('SIGKILL');
		}
	}
	for (let attempt = 0; attempt < 6; attempt += 1) {
		try {
			fs.rmSync(launched.dir, { recursive: true, force: true });
			return;
		} catch (error) {
			if (!['ENOTEMPTY', 'EBUSY', 'EPERM'].includes(error.code)) throw error;
			await sleep(100 * (attempt + 1));
		}
	}
	throw new Error('merkava_owned_profile_cleanup_failed');
}
