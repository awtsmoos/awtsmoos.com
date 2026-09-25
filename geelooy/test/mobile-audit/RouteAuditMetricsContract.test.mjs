//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RouteAuditMetricsContract
 * @description
 * The Awtsmoos separates concealed structure from lost keyboard focus through measured browser truth;
 * Awtsmoos.com keeps overlay geometry strict and hidden-tab review limited to controls a user can actually reach.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const metricsSource = readFileSync(
	new URL('./RouteAuditMetrics.mjs', import.meta.url),
	'utf8'
);
const helperSource = readFileSync(
	new URL('./RouteAuditMetricHelpers.mjs', import.meta.url),
	'utf8'
);

test('collector delegates browser geometry instead of duplicating helper policy', () => {
	assert.match(metricsSource, /helpers\.isVisible/);
	assert.match(metricsSource, /helpers\.isOverlay/);
	assert.match(metricsSource, /helpers\.hasIntentionalHorizontalScroller/);
	assert.doesNotMatch(metricsSource, /function isVisible/);
	assert.doesNotMatch(metricsSource, /function isOverlay/);
});

test('hidden tab evidence excludes CSS-removed and focus-reveal controls', () => {
	assert.match(metricsSource, /helpers\.isCssRemovedFromTabOrder/);
	assert.match(metricsSource, /helpers\.isFocusRevealLink/);
	assert.match(metricsSource, /element\.tabIndex >= 0/);
	assert.match(helperSource, /details:not\(\[open\]\)/);
});

test('overlay evidence follows layout behavior instead of naming guesses', () => {
	assert.match(helperSource, /style\.position === "fixed"/);
	assert.match(helperSource, /style\.position === "sticky"/);
	assert.match(helperSource, /style\.position !== "absolute"/);
	assert.match(helperSource, /\[role="dialog"\]/);
	assert.match(helperSource, /\[role="menu"\]/);
	assert.doesNotMatch(helperSource, /\/menu\|sheet\|drawer\|dialog\|popover/);
});
