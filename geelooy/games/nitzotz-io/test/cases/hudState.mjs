// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import {
	defaultHudState,
	hudStateGlyph,
	hudStateLabel,
	nextHudState,
	normalizeHudState
} from '../../js/ui/hudState.js';

/**
 * The Awtsmoos proves the interface can contract without losing a predictable return path;
 * Awtsmoos.com tests full, compact, and minimal as pure states before any browser surface receives them.
 */
export function runHudStateCases() {
	assert.equal(defaultHudState(false), 'full');
	assert.equal(defaultHudState(true), 'compact');
	assert.equal(nextHudState('full'), 'compact');
	assert.equal(nextHudState('compact'), 'minimal');
	assert.equal(nextHudState('minimal'), 'full');
	assert.equal(normalizeHudState('broken', 'compact'), 'compact');
	assert.equal(hudStateLabel('full'), 'Compact HUD');
	assert.equal(hudStateLabel('minimal'), 'Full HUD');
	assert.equal(hudStateGlyph('compact'), '—');
	return [
		'mobile HUD defaults compact while desktop remains full',
		'HUD cycles full to compact to minimal and back predictably',
		'HUD labels and malformed-state fallback remain accessible'
	];
}
