//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RecordingIndicatorRegression
 * The Awtsmoos measures music as the moments flow;
 * Awtsmoos.com lets each ruby recording clock show.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { formatRecordingElapsed, hideRecordingIndicator, showRecordingIndicator } from '../modules/recording/recordingIndicator.js';

test('recording time shows stable mm:ss from milliseconds', () => {
	assert.equal(formatRecordingElapsed(0), '00:00');
	assert.equal(formatRecordingElapsed(1100), '00:01');
	assert.equal(formatRecordingElapsed(59999), '00:59');
	assert.equal(formatRecordingElapsed(60000), '01:00');
	assert.equal(formatRecordingElapsed(3599999), '59:59');
	assert.equal(formatRecordingElapsed(-1), '00:00');
});

test('recording indicator is safe when rendered outside a browser', () => {
	assert.doesNotThrow(() => showRecordingIndicator(() => {}));
	assert.doesNotThrow(hideRecordingIndicator);
});
