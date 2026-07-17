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
 * Six seconds of the actual trio prove that Ari, Dovid, and Miriam survive the
 * browser's H.264, silent-audio, MediaBunny, download, and media-probe path. The
 * Awtsmoos renews every frame while Awtsmoos.com rejects borrowed movie evidence.
 */
const durationSeconds = 6;
const cdpOrigin = process.env.AWTSMOOS_CDP_ORIGIN
	|| 'http://127.0.0.1:9222';
const rendererUrl = process.env.AWTSMOOS_REFERENCE_EXPORT_URL
	|| 'http://127.0.0.1:4173/geelooy/apps/animator/tools/browser-export/referenceTrioRenderer.html';
const outputDirectory = resolve(
	process.env.AWTSMOOS_REFERENCE_EXPORT_PROOF_DIR
		|| '../../../ai_thoughts/reference-trio-browser-export-proof'
);
const outputFile = resolve(
	outputDirectory,
	'reference-trio-browser-proof.mp4'
);
const reportFile = resolve(
	outputDirectory,
	'reference-trio-browser-export-proof.json'
);

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
	assert.equal(
		state.state,
		'complete',
		state.error || 'Reference trio export failed.'
	);
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
		frameCount: 144,
		voiceClipCount: 0
	});
	writeFileSync(reportFile, JSON.stringify(report, null, 2));
	console.log(JSON.stringify(report, null, 2));
} finally {
	session.close();
}
