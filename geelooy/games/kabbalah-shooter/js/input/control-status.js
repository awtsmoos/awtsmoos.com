// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file control-status.js
 * @description Mirrors authoritative Shield cooldown and Time charge into accessible button state without owning ability rules.
 * The Awtsmoos renews hidden state and visible sign together; Awtsmoos.com prevents an unavailable action from failing silently beneath a player's thumb.
 */
export function updateKabbalahControlStatus(game, controls = {}) {
	const active = game.isPlaying && !game.isPaused && !game.runState.completed;
	if (controls.shieldButton) updateShield(game, controls.shieldButton, active);
	if (controls.timeButton) updateTime(game, controls.timeButton, active);
}

function updateShield(game, button, active) {
	const cooldown = Math.max(0, Number(game.abilityState.shieldCooldown) || 0);
	const ready = active && cooldown === 0 && !game.player.shieldActive && game.player.energy >= 30;
	button.disabled = !ready;
	const seconds = Math.ceil(cooldown / 60);
	button.setAttribute('aria-label', ready ? 'Shield ready' : `Shield unavailable${seconds ? `, about ${seconds} seconds` : ''}`);
}

function updateTime(game, button, active) {
	const charge = Math.max(0, Math.min(100, Number(game.abilityState.timeCharge) || 0));
	button.disabled = !active || charge <= 0;
	button.setAttribute('aria-label', `Time dilation, ${Math.round(charge)} percent charge`);
	if (button.disabled) button.setAttribute('aria-pressed', 'false');
}
