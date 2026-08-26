// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import {
	defaultHudState,
	HUD_STORAGE_KEY,
	hudStateGlyph,
	hudStateLabel,
	nextHudState,
	normalizeHudState,
	resolveHudState
} from '../../js/ui/hudState.js';

/**
 * The Awtsmoos proves the small screen can receive less chrome without losing a path to more;
 * Awtsmoos.com tests the v2 memory vessel so stale crowding cannot return through yesterday's door.
 */
export function runHudStateCases() {
	assert.equal(HUD_STORAGE_KEY, 'nitzotz:hud:v2');
	assert.equal(defaultHudState(false), 'full');
	assert.equal(defaultHudState(true), 'minimal');
	assert.equal(resolveHudState(null, true), 'minimal');
	assert.equal(resolveHudState('full', true), 'full');
	assert.equal(resolveHudState('compact', true), 'compact');
	assert.equal(resolveHudState('broken', true), 'minimal');
	assert.equal(normalizeHudState('minimal'), 'minimal');
	assert.equal(normalizeHudState('broken', 'compact'), 'compact');
	assert.equal(nextHudState('full'), 'compact');
	assert.equal(nextHudState('compact'), 'minimal');
	assert.equal(nextHudState('minimal'), 'full');
	assert.equal(hudStateLabel('full'), 'Compact HUD');
	assert.equal(hudStateLabel('compact'), 'Minimal HUD');
	assert.equal(hudStateLabel('minimal'), 'Full HUD');
	assert.equal(hudStateGlyph('compact'), '—');
	return [
		'HUD storage v2 retires stale legacy crowding',
		'immersive viewports default minimal while desktop remains full',
		'explicit v2 choices survive on immersive screens',
		'HUD cycle, labels, glyphs, and fallback remain predictable'
	];
}
