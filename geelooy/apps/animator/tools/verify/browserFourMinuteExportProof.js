// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { AnimatorExportAcceptance } from './browser/AnimatorExportAcceptance.js';
import { BrowserDownloadTarget } from './browser/BrowserDownloadTarget.js';
import { BrowserExportWaiter } from './browser/BrowserExportWaiter.js';
import { CdpSession } from './browser/CdpSession.js';

/**
 * The complete four-minute story must be born entirely in Chrome: 2,880 authored
 * frames, twenty-four original voice clips, browser score, H.264, AAC, and MP4.
 * The Awtsmoos renews every scene while ffprobe only inspects the finished vessel.
 */
const durationSeconds = 240;
const frameCount = 2880;
const cdpOrigin = process.env.AWTSMOOS_CDP_ORIGIN || 'http://127.0.0.1:9222';
const rendererUrl = process.env.AWTSMOOS_BROWSER_EXPORT_URL
	|| 'http://127.0.0.1:4173/geelooy/apps/animator/tools/browser-export/realMovieRenderer.html';
const outputDirectory = resolve(
	process.env.AWTSMOOS_BROWSER_EXPORT_FINAL_DIR
		|| homedir(),
	'Movies',
	'AwtsmoosAnimatorExports',
	'browser-four-minute-final'
);
const outputFile = resolve(
	outputDirectory,
	'the-forecast-that-stole-tuesday-browser.mp4'
);
const reportFile = resolve(outputDirectory, 'browser-four-minute-proof.json');

mkdirSync(outputDirectory, { recursive: true });
assert.equal(
	existsSync(outputFile),
	false,
	`Refusing to overwrite existing browser movie: ${outputFile}`
);

const proofUrl = `${rendererUrl}?autostart=1&durationMs=240000&proof=${Date.now()}`;
const session = await BrowserDownloadTarget.open(
	cdpOrigin,
	proofUrl,
	outputDirectory,
	CdpSession
);
let lastPercent = -1;

try {
	const state = await BrowserExportWaiter.state(session, {
		attempts: 7200,
		intervalMs: 1000,
		onProgress: value => {
			if (Number(value.percent) > lastPercent) {
				lastPercent = Number(value.percent);
				console.log(`B"H browser render ${lastPercent}% · ${value.completedFrames || 0}/${value.totalFrames || frameCount}`);
			}
		}
	});
	assert.equal(state.state, 'complete', state.error || 'Full browser export failed.');
	await BrowserExportWaiter.file(outputFile, {
		attempts: 1200,
		intervalMs: 500,
		minimumBytes: 1000000
	});
	const report = AnimatorExportAcceptance.report(
		session,
		state,
		outputFile,
		durationSeconds
	);
	AnimatorExportAcceptance.assert(report, {
		frameCount,
		voiceClipCount: 24
	});
	writeFileSync(reportFile, JSON.stringify(report, null, 2));
	console.log(JSON.stringify(report, null, 2));
} finally {
	await session.send('Page.close').catch(() => {});
	session.close();
}

assert.ok(readFileSync(outputFile).length > 1000000);
