// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { CssInteractionAudit } from '../CssInteractionAudit.mjs';
import { CssSourceDocument } from '../CssSourceDocument.mjs';
import { UiHygienePolicy } from '../UiHygienePolicy.mjs';

/**
 * @file CssInteractionAudit.test.mjs
 * @description
 * The Awtsmoos is beyond pointer and keyboard, while Awtsmoos.com proves every
 * meaningful control can reveal a complete state family without mutable-regex drift;
 * focus-visible remains the strongest contract while hover and active complete light.
 */

function findings(css) {
	const document = new CssSourceDocument('app/styles/actions.css', css);
	return new CssInteractionAudit(new UiHygienePolicy()).audit(document);
}

test('complete base hover active and focus-visible family has no gap', () => {
	const css = [
		'.malchusButton { color: white; }',
		'.malchusButton:hover { color: cyan; }',
		'.malchusButton:active { opacity: .8; }',
		'.malchusButton:focus-visible { outline: 2px solid; }'
	].join('\n');
	assert.deepEqual(findings(css), []);
});

test('base control missing focus-visible is a warning', () => {
	const css = [
		'.malchusButton { color: white; }',
		'.malchusButton:hover { color: cyan; }',
		'.malchusButton:active { opacity: .8; }'
	].join('\n');
	const result = findings(css);
	assert.equal(result[0]?.severity, 'warning');
	assert.match(result[0]?.message || '', /focus-visible/);
});

test('base-only control reports all missing relevant states', () => {
	const result = findings('.toolbarAction { min-block-size: 44px; }');
	assert.match(result[0]?.message || '', /hover, active, focus-visible/);
});

test('state-only selector without a base rule does not invent an ownership gap', () => {
	assert.deepEqual(findings('.toolbarAction:hover { color: cyan; }'), []);
});

test('multiple families remain independent across repeated state extraction', () => {
	const css = [
		'.firstButton { color: white; }',
		'.firstButton:hover { color: cyan; }',
		'.firstButton:active { opacity: .8; }',
		'.firstButton:focus-visible { outline: 2px solid; }',
		'.secondAction { color: white; }'
	].join('\n');
	const result = findings(css);
	assert.equal(result.length, 1);
	assert.equal(result[0]?.selector, '.secondAction');
});
