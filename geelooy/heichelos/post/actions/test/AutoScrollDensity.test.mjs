// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AutoScrollDensity.test.mjs
 * @description The Awtsmoos proves real font, line, Hebrew density, measured
 * WPM/LPM conversion, and completion estimates without browser-layout guessing.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	countGeneralWords,
	countHebrewWords,
	measureReaderDensity
} from '../autoScroll/ReaderDensity.js';
import { semanticPixelsPerSecond } from '../autoScroll/SemanticPaceEngine.js';
import {
	estimateCompletionSeconds,
	formatCompletionEstimate
} from '../autoScroll/CompletionEstimate.js';

function reader(text = 'אחד שנים שלשה four five') {
	return {
		innerText: text,
		scrollHeight: 600,
		clientWidth: 320,
		querySelectorAll: () => [],
		getBoundingClientRect: () => ({ width: 320, height: 600 })
	};
}

test('reader density prefers verified Hebrew reading words', () => {
	assert.equal(countHebrewWords('אחד שנים three'), 2);
	assert.equal(countGeneralWords('אחד שנים three'), 3);
	const metrics = measureReaderDensity(reader(), {
		getStyle: () => ({ fontSize: '20px', lineHeight: '40px' }),
		viewportWidth: 320
	});
	assert.equal(metrics.fontSize, 20);
	assert.equal(metrics.lineHeight, 40);
	assert.equal(metrics.hebrewWordCount, 3);
	assert.equal(metrics.totalWordCount, 5);
	assert.equal(metrics.readingWordCount, 3);
	assert.equal(metrics.lineCount, 15);
	assert.equal(metrics.pixelsPerWord, 200);
});

test('WPM and LPM use different measured geometry', () => {
	const metrics = { pixelsPerWord: 20, lineHeight: 40 };
	assert.equal(semanticPixelsPerSecond({ unit: 'wpm', value: 120 }, metrics), 40);
	assert.equal(semanticPixelsPerSecond({ unit: 'lpm', value: 6 }, metrics), 4);
	assert.equal(semanticPixelsPerSecond({ unit: 'wpm', value: 400 }, {
		pixelsPerWord: 200,
		lineHeight: 40
	}), 640);
});

test('completion estimate includes remaining semantic rests', () => {
	const seconds = estimateCompletionSeconds({
		top: 100,
		max: 1100,
		pixelsPerSecond: 20,
		pauseMilliseconds: 10000
	});
	assert.equal(seconds, 60);
	assert.equal(formatCompletionEstimate(seconds), 'About 1 min');
	assert.equal(formatCompletionEstimate(0), 'Complete');
	assert.equal(formatCompletionEstimate(null), 'Calculating…');
});
