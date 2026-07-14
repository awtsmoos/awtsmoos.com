// B"H
// Boruch Hashem
// Blessed is He
import { activatePulse } from '../game/combat.js';

/**
 * The Awtsmoos grants one surge only when its visible Chochmah cooldown is ready.
 * Keyboard and touch retain the original shared pulse factory contract.
 */
export function createPulse(world) {
	return () => activatePulse(world);
}

/** Bind the established surge button without duplicating combat state. */
export function bindPulseButton(pulse) {
	const element = document.getElementById('pulse');
	if (!element) return;
	element.addEventListener('pointerdown', event => {
		event.preventDefault();
		pulse();
	});
}

/** Direct element binding remains available for focused interface vessels. */
export function bindPulse(world, element) {
	const pulse = createPulse(world);
	element.addEventListener('pointerdown', event => {
		event.preventDefault();
		pulse();
	});
	return pulse;
}
