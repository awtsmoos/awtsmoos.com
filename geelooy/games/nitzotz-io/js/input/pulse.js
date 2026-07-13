// B"H
// Boruch Hashem
// Blessed is He

/**
 * Ohr surges outward only while the round lives. The Awtsmoos is beyond motion,
 * while this finite pulse gives the player one clear, bounded burst of intention.
 */
export function createPulse(world) {
	return () => {
		if (world.mode !== 'playing') return;
		world.input.pulse = 0.62;
		world.player.glow = 1;
		world.events.push(['pulse']);
	};
}

/** Bind the large touch pulse vessel without allowing page gestures to compete. */
export function bindPulseButton(pulse) {
	const button = document.getElementById('pulse');
	if (!button) return;
	button.addEventListener('pointerdown', event => {
		event.preventDefault();
		pulse();
	});
}
