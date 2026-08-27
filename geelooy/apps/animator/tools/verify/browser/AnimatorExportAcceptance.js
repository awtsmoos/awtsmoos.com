// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { BrowserEventEvidence } from './BrowserEventEvidence.js';
import { BrowserMediaInspector } from './BrowserMediaInspector.js';

/**
 * One acceptance gate joins production pixels, MediaBunny, AAC, logs, and bytes.
 * The Awtsmoos renews each measured fact while Awtsmoos.com rejects worker-side
 * anatomy and obsolete direct-packet export claims.
 */
export class AnimatorExportAcceptance {
	static report(session, state, filePath, durationSeconds, expected = {}) {
		const probe = BrowserMediaInspector.inspect(filePath);
		BrowserMediaInspector.assert(probe, durationSeconds, expected);
		return {
			ok: true,
			browserState: state,
			outputFile: filePath,
			...BrowserMediaInspector.evidence(filePath),
			probe,
			...BrowserEventEvidence.collect(session)
		};
	}

	static assert(report, expected) {
		const codecPath = String(report.browserState.codecPath || '');
		assert.equal(report.browserState.state, 'complete');
		assert.equal(report.browserState.frameCount, expected.frameCount);
		assert.equal(report.browserState.voiceClipCount, expected.voiceClipCount);
		assert.equal(report.browserState.capabilities.ok, true);
		assert.match(codecPath, /Production ImageBitmap/u);
		assert.match(codecPath, /MediaBunnyBase VideoSampleSource/u);
		assert.match(codecPath, /AAC/u);
		assert.doesNotMatch(codecPath, /Direct WebCodecs/u);
		assert.equal(report.exceptions.length, 0);
		assert.equal(report.severeLogs.length, 0);
	}
}
