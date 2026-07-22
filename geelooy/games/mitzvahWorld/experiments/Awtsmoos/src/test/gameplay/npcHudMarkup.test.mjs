// B"H
// Boruch Hashem
// Blessed is He

/** @file npcHudMarkup.test.mjs @description Proves readable player XP and hostile combat metadata markup. */

import assert from 'node:assert/strict';
import test from 'node:test';
import { npcPlayerCard, npcTargetCard } from '../../ui/NpcHudMarkup.js';

test('player card renders canonical XP maximum and armor', () => {
	const markup = npcPlayerCard({ armor: 9, face: '🎩', health: 92, level: 2, maxHealth: 100, name: 'Chossid', xp: 52, xpMax: 270 });
	assert.match(markup, /XP 52\/270/);
	assert.match(markup, /Armor 9/);
});

test('hostile target card renders level, health, and armor', () => {
	const markup = npcTargetCard({ armor: 10, combatLevel: 4, faction: 'hostile', health: 41, maxHealth: 82, name: 'Portal Wraith' });
	assert.match(markup, /Level 4/);
	assert.match(markup, /Health 41\/82/);
	assert.match(markup, /Armor 10/);
});
