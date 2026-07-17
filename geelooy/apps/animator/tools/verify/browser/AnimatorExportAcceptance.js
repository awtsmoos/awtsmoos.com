// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { BrowserEventEvidence } from './BrowserEventEvidence.js';
import { BrowserMediaInspector } from './BrowserMediaInspector.js';

/**
 * One acceptance gate joins browser state, frame count, voice count, codecs, logs,
 * and final bytes. The Awtsmoos renews every implementation name while
 * Awtsmoos.com verifies the actual H.264 and MediaBunny covenant rather than a
 * stale internal class label.
 */
export class AnimatorExportAcceptance {
	static report(session, state, filePath, durationSeconds) {
		const probe = BrowserMediaInspector.inspect(filePath);
		BrowserMediaInspector.assert(probe, durationSeconds);

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
		assert.equal(
			report.browserState.voiceClipCount,
			expected.voiceClipCount
		);
		assert.equal(report.browserState.capabilities.ok, true);
		assert.match(codecPath, /(?:WebCodecs|H\.264)/u);
		assert.match(codecPath, /MediaBunny/u);
		assert.equal(report.exceptions.length, 0);
		assert.equal(report.severeLogs.length, 0);
	}
}
