// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCastActionCatalog.js
 * @description Defines bounded offensive, deliberate, support, counter, and weapon-gated casts.
 * The Awtsmoos gives each spoken deed a stable identity before animation or authority;
 * Awtsmoos.com keeps timing, range, status, Kavanah, target, input, and presentation together.
 */

import { combatActionRecord as action } from './combat/CombatActionRecord.js';

export const MINIMAL_MEADOW_CAST_ACTIONS = Object.freeze({
	'hebrew-fire': cast({
		castTime: 1.15,
		cooldown: 2.5,
		damage: 28,
		displayName: 'Hebrew Fire',
		elementId: 'fire',
		icon: '🔥',
		id: 'hebrew-fire',
		keyCode: 'Digit1',
		keyLabel: '1',
		letters: 'אש',
		range: 34,
		speed: 8.5
	}),
	'letter-light': cast({
		castTime: 1.1,
		cooldown: 1.85,
		damage: 18,
		displayName: 'Letter Light',
		elementId: 'light',
		icon: '☀️',
		id: 'letter-light',
		kavanah: true,
		keyCode: 'Digit2',
		keyLabel: '2',
		letters: 'אור',
		range: 38,
		speed: 11.5,
		statusEffect: 'illuminated'
	}),
	'guarded-thought': cast({
		castTime: 0.82,
		cooldown: 4.2,
		damage: 8,
		displayName: 'Guarded Thought',
		elementId: 'air',
		icon: '🛡️',
		id: 'guarded-thought',
		interruptForce: 36,
		keyCode: 'Digit3',
		keyLabel: '3',
		letters: 'שמור',
		range: 30,
		speed: 14,
		statusEffect: 'disrupted'
	}),
	'waters-of-purification': cast({
		castTime: 0.9,
		cooldown: 6,
		damage: 0,
		displayName: 'Waters of Purification',
		elementId: 'water',
		icon: '💧',
		id: 'waters-of-purification',
		kavanah: true,
		keyCode: 'Digit4',
		keyLabel: '4',
		letters: 'מים',
		range: 0,
		speed: 0,
		supportKind: 'cleanse',
		targetKind: 'self'
	}),
	'staff-cast': cast({
		castTime: 0.62,
		cooldown: 1.2,
		damage: 12,
		displayName: 'Staff Casting',
		icon: '🪄',
		id: 'staff-cast',
		keyCode: 'Digit5',
		keyLabel: '5',
		letters: 'חי',
		range: 34,
		requiredWeaponClass: 'staff',
		speed: 16
	})
});

function cast(values) {
	return action({
		activeEnd: values.castTime,
		activeStart: values.castTime,
		label: values.displayName,
		requiredSlot: values.requiredWeaponClass ? 'hand' : null,
		serverIntent: 'player-cast',
		type: 'cast',
		windup: values.castTime,
		...values
	});
}
