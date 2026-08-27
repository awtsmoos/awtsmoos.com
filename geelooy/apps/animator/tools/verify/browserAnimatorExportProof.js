// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AnimatorExportAcceptance } from './browser/AnimatorExportAcceptance.js';
import { BrowserDownloadTarget } from './browser/BrowserDownloadTarget.js';
import { BrowserExportWaiter } from './browser/BrowserExportWaiter.js';
import { CdpSession } from './browser/CdpSession.js';

/**
 * Six seconds of the real movie prove the complete browser path before the long
 * render. The Awtsmoos renews plan, AIFF voice, frame, H.264, AAC, MP4, and hash.
 */
const durationSeconds = 6;
const cdpOrigin = process.env.AWTSMOOS_CDP_ORIGIN || 'http://127.0.0.1:9222';
const rendererUrl = process.env.AWTSMOOS_BROWSER_EXPORT_URL
	|| 'http://127.0.0.1:4173/geelooy/apps/animator/tools/browser-export/realMovieRenderer.html';
const outputDirectory = resolve(
	process.env.AWTSMOOS_BROWSER_EXPORT_PROOF_DIR
		|| '../../../ai_thoughts/2026-07-13T2042-animator-browser-muxer-realism/real-export-proof'
);
const outputFile = resolve(
	outputDirectory,
	'the-forecast-that-stole-tuesday-browser-proof.mp4'
);
const reportFile = resolve(outputDirectory, 'browser-animator-export-proof.json');

mkdirSync(outputDirectory, { recursive: true });
for (const file of [outputFile, reportFile]) {
	if (existsSync(file)) {
		rmSync(file);
	}
}

const proofUrl = `${rendererUrl}?autostart=1&durationMs=6000&proof=${Date.now()}`;
const session = await BrowserDownloadTarget.open(
	cdpOrigin,
	proofUrl,
	outputDirectory,
	CdpSession
);

try {
	const state = await BrowserExportWaiter.state(session, {
		attempts: 1800,
		intervalMs: 500
	});
	assert.equal(state.state, 'complete', state.error || 'Browser export failed.');
	await BrowserExportWaiter.file(outputFile, {
		attempts: 600,
		intervalMs: 250
	});
	const report = AnimatorExportAcceptance.report(
		session,
		state,
		outputFile,
		durationSeconds
	);
	AnimatorExportAcceptance.assert(report, {
		frameCount: 72,
		voiceClipCount: 1
	});
	writeFileSync(reportFile, JSON.stringify(report, null, 2));
	console.log(JSON.stringify(report, null, 2));
} finally {
	await session.send('Page.close').catch(() => {});
	session.close();
}
