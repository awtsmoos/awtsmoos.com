//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RouteAuditEvidencePolicy.test
 * @description
 * Tests the narrow bridge where Awtsmoos.com separates intentional keyboard access from genuine viewport escape.
 * The Awtsmoos reveals every measured edge: no unknown overlay may borrow the skip-link exemption and disappear from review.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyAuditSeverity } from './RouteAuditEvidencePolicy.mjs';

function makeCleanMetrics(overrides = {}) {
	return {
		document: { horizontalOverflow: false },
		overlayEscapeCount: 0,
		overlayEscapes: [],
		escapedCount: 0,
		defaultishControlCount: 0,
		undersizedControlCount: 0,
		hiddenTabbableCount: 0,
		bodyDefaultSignals: {
			defaultFont: false,
			defaultMargin: false
		},
		...overrides
	};
}

function makeSkipEscape(rect = [12, -57, 185, 45]) {
	return {
		tag: 'a',
		id: '',
		className: 'awtsmoos-skip-link',
		rect
	};
}

test('clean route evidence passes', () => {
	assert.equal(classifyAuditSeverity(makeCleanMetrics()), 'pass');
});

test('fully offscreen universal skip link does not create a false failure', () => {
	const metrics = makeCleanMetrics({
		overlayEscapeCount: 1,
		overlayEscapes: [makeSkipEscape()]
	});
	assert.equal(classifyAuditSeverity(metrics), 'pass');
});

test('soft evidence still keeps the skip-link case under review', () => {
	const metrics = makeCleanMetrics({
		overlayEscapeCount: 1,
		overlayEscapes: [makeSkipEscape()],
		hiddenTabbableCount: 1
	});
	assert.equal(classifyAuditSeverity(metrics), 'review');
});

test('ordinary escaped overlay still fails', () => {
	const metrics = makeCleanMetrics({
		overlayEscapeCount: 1,
		overlayEscapes: [{ tag: 'div', className: 'dialog', rect: [0, -20, 200, 40] }]
	});
	assert.equal(classifyAuditSeverity(metrics), 'fail');
});

test('skip link plus another escaped overlay still fails', () => {
	const metrics = makeCleanMetrics({
		overlayEscapeCount: 2,
		overlayEscapes: [
			makeSkipEscape(),
			{ tag: 'aside', className: 'drawer', rect: [-20, 0, 300, 700] }
		]
	});
	assert.equal(classifyAuditSeverity(metrics), 'fail');
});

test('truncated overlay descriptions fail conservatively', () => {
	const metrics = makeCleanMetrics({
		overlayEscapeCount: 2,
		overlayEscapes: [makeSkipEscape()]
	});
	assert.equal(classifyAuditSeverity(metrics), 'fail');
});

test('partially visible skip link still fails', () => {
	const metrics = makeCleanMetrics({
		overlayEscapeCount: 1,
		overlayEscapes: [makeSkipEscape([12, -20, 185, 45])]
	});
	assert.equal(classifyAuditSeverity(metrics), 'fail');
});

test('runtime exception remains broken', () => {
	const signals = [{ kind: 'exception', text: 'boom' }];
	assert.equal(classifyAuditSeverity(makeCleanMetrics(), signals), 'broken');
});
