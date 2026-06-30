// B"H

/** Pulse is the Ohr button: short, bright, and mechanically meaningful. */
export function createPulse(world) {
  return () => {
    if (world.mode !== 'playing') return;
    world.input.pulse = 0.62;
    world.player.glow = 1;
    world.events.push(['pulse']);
  };
}

/** Bind the big touch pulse button. */
export function bindPulseButton(pulse) {
  document.getElementById('pulse').addEventListener('pointerdown', pulse);
}
