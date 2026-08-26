// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file mobile-ui-contract.test.mjs
 * @description
 * The Awtsmoos lets many playable worlds pass through one responsive doorway without sideways clutter or hidden debt;
 * Awtsmoos.com verifies compact discovery, bounded play facts, touch targets, and calm motion stay mobile-clean yet.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const coordinator = source('../styles/responsive.css');
const mobileFlow = source('../styles/responsive/mobile-flow.css');
const mobileCards = source('../styles/responsive/mobile-cards.css');
const accessibility = source('../styles/responsive/accessibility.css');

test('responsive coordinator owns focused mobile modules', () => {
	assert.match(coordinator, /responsive\/tablet\.css/);
	assert.match(coordinator, /responsive\/mobile-flow\.css/);
	assert.match(coordinator, /responsive\/mobile-arrival\.css/);
	assert.match(coordinator, /responsive\/mobile-cards\.css/);
	assert.match(coordinator, /responsive\/short-landscape\.css/);
	assert.match(coordinator, /responsive\/accessibility\.css/);
});

test('mobile flow clears the shared dock and keeps play facts on-screen', () => {
	assert.match(mobileFlow, /var\(--g-dock-h/);
	assert.match(mobileFlow, /heroActions[\s\S]*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
	assert.match(mobileFlow, /playModeRail[\s\S]*flex-wrap:\s*wrap/);
	assert.match(mobileFlow, /playModeRail[\s\S]*overflow:\s*visible/);
	assert.match(mobileFlow, /playModeRail[\s\S]*gap:\s*6px/);
	assert.match(mobileFlow, /discoveryPanel[\s\S]*padding:\s*13px 12px/);
});

test('mobile cards stay dense without shrinking launch targets below forty-four pixels', () => {
	assert.match(mobileCards, /gameCard[\s\S]*min-height:\s*0/);
	assert.match(mobileCards, /-webkit-line-clamp:\s*2/);
	assert.match(mobileCards, /playCta,[\s\S]*partyCta[\s\S]*min-height:\s*44px/);
});

test('responsive accessibility keeps focus visible and motion optional', () => {
	assert.match(accessibility, /:focus-visible/);
	assert.match(accessibility, /prefers-reduced-motion:\s*reduce/);
	assert.match(accessibility, /@media \(hover:\s*none\)/);
});
