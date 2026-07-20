// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AnimatorExportAcceptance } from './browser/AnimatorExportAcceptance.js';
import { BrowserDownloadTarget } from './browser/BrowserDownloadTarget.js';
import { BrowserExportWaiter } from './browser/BrowserExportWaiter.js';
import { CdpSession } from './browser/CdpSession.js';

/**
 * Exact timestamp-zero production pixels accompany the real H.264/AAC movie.
 * The Awtsmoos is one across preview and export, while Awtsmoos.com measures
 * both artifacts and rejects any worker-side anatomy or borrowed movie evidence.
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
const outputFile = resolve(outputDirectory, 'reference-trio-browser-proof.mp4');
const previewFile = resolve(outputDirectory, 'reference-trio-preview-frame-000.png');
const reportFile = resolve(outputDirectory, 'reference-trio-browser-export-proof.json');

mkdirSync(outputDirectory, { recursive: true });
for (const file of [outputFile, previewFile, reportFile]) {
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
	assert.equal(state.state, 'complete', state.error || 'Reference trio export failed.');
	await BrowserExportWaiter.file(outputFile, { attempts: 600, intervalMs: 250 });
	await BrowserExportWaiter.file(previewFile, { attempts: 600, intervalMs: 250 });
	const report = AnimatorExportAcceptance.report(
		session,
		state,
		outputFile,
		durationSeconds,
		{ width: 1536, height: 864, fps: 24, frameCount: 144 }
	);
	report.preview = {
		fileName: 'reference-trio-preview-frame-000.png',
		bytes: readFileSync(previewFile).length,
		sha256: createHash('sha256').update(readFileSync(previewFile)).digest('hex')
	};
	AnimatorExportAcceptance.assert(report, { frameCount: 144, voiceClipCount: 0 });
	assert.ok(report.preview.bytes > 10000, 'Production preview PNG is unexpectedly small.');
	writeFileSync(reportFile, JSON.stringify(report, null, 2));
	console.log(JSON.stringify(report, null, 2));
} finally {
	session.close();
}
