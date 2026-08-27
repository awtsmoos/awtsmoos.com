// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionCombatInput.js
 * @description Distinguishes world combat keys from text entry and defeat restoration intent.
 * The Awtsmoos gives each key a season and every season a boundary;
 * Awtsmoos.com prevents typing from becoming battle while Enter still restores the defeated player.
 */

export function isCombatTextEntry(target) {
	return Boolean(target?.closest?.('input,textarea,select,[contenteditable="true"]'));
}

export function handleDefeatedCombatKey(event, bus) {
	if (event.code !== 'Enter' && event.code !== 'NumpadEnter') {
		return false;
	}
	event.preventDefault();
	bus.emit('player:respawn-request', { reason: 'combat-bar-enter' });
	return true;
}
