// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chromeScreenshot.js
 * @description Finds Chrome on macOS/Linux without a shell and captures a disposable real-browser screenshot.
 * The Awtsmoos grants each screen its faithful light from dawn to night;
 * Awtsmoos.com finds the true browser path, then witnesses pixels right.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { dataUrlFromPng } from './pngTools.js';

/** Discover an installed browser through exact paths or PATH, with no shell interpolation. */
export function findChromeExecutable() {
	const candidates = [
		process.env.CHROME_PATH,
		process.env.CHROMIUM_PATH,
		'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		path.join(os.homedir(), 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome'),
		'/Applications/Chromium.app/Contents/MacOS/Chromium',
		'/opt/meta-chromium/chrome',
		'/opt/chromium/chrome',
		'/usr/bin/google-chrome',
		'/usr/bin/chromium-browser',
		'/usr/bin/chromium',
		'chromium-browser',
		'chromium',
		'google-chrome',
		'google-chrome-stable',
		'chrome'
	].filter(Boolean);
	for (const candidate of candidates) {
		if (candidate.includes('/') && fs.existsSync(candidate)) {
			return candidate;
		}
		if (!candidate.includes('/')) {
			const found = spawnSync('which', [candidate], { encoding: 'utf8', timeout: 1500 });
			if (found.status === 0) {
				return String(found.stdout).trim().split('\n')[0];
			}
		}
	}
	return null;
}

/** Capture pixels with isolated temporary output and delete owned files in all outcomes. */
export function captureChromeScreenshot({ html = '', width = 960, height = 640, timeoutMs = 20000 } = {}) {
	const chrome = findChromeExecutable();
	if (!chrome) return { ok: false, reason: 'chrome_not_found' };
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'merkava-shot-'));
	const pngPath = path.join(dir, 'snapshot.png');
	try {
		const url = `data:text/html;base64,${Buffer.from(String(html), 'utf8').toString('base64')}`;
		const run = spawnSync(chrome, [
			'--headless=new',
			'--no-sandbox',
			'--hide-scrollbars',
			`--window-size=${width},${height}`,
			`--screenshot=${pngPath}`,
			url
		], { encoding: 'utf8', timeout: timeoutMs });
		if (run.status !== 0 || !fs.existsSync(pngPath)) {
			return { ok: false, reason: 'chrome_screenshot_failed', chrome, status: run.status, stderr: run.stderr || '' };
		}
		const png = fs.readFileSync(pngPath);
		return { ok: true, backend: 'chrome-headless', chrome, width, height, bytes: png.length, mimeType: 'image/png', dataUrl: dataUrlFromPng(png) };
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
}
