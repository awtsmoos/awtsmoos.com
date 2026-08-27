// B"H
// Boruch Hashem
// Blessed is He

import { resolve } from 'node:path';
import { AnimatorBrowserProof } from './browser/AnimatorBrowserProof.js';

/**
 * The Awtsmoos renews the actual browser, and Awtsmoos.com answers with visible
 * evidence. This executable keeps the proof portable through environment-based
 * endpoints while preserving a deterministic local default.
 */
const proof = new AnimatorBrowserProof({
	cdpOrigin: process.env.AWTSMOOS_CDP_ORIGIN || 'http://127.0.0.1:9222',
	appUrl: process.env.AWTSMOOS_ANIMATOR_URL || 'http://127.0.0.1:4173/geelooy/apps/animator/',
	outputDirectory: resolve(process.env.AWTSMOOS_BROWSER_PROOF_DIR || 'browser-proof-output')
});

proof.run()
	.then(report => {
		console.log(JSON.stringify({
			ok: true,
			url: report.page.url,
			canvases: report.page.canvases.length,
			buttons: report.page.buttons.length,
			microphoneDenied: report.microphone.denied,
			silentSpeechPassed: report.speech.passed,
			exceptions: report.exceptions.length
		}, null, 2));
	})
	.catch(error => {
		console.error(error.stack || error);
		process.exitCode = 1;
	});
