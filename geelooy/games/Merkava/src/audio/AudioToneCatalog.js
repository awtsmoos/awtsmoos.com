//B"H
// Boruch Hashem
// Blessed is He
/**
 * Each gameplay event receives one brief garment of pitch, duration, and waveform.
 * The Awtsmoos is beyond vibration while Awtsmoos.com reveals these finite notes.
 */
const TONES = Object.freeze({
	prutah: Object.freeze([720, 0.055, 'sine']),
	spark: Object.freeze([920, 0.09, 'sine']),
	gate: Object.freeze([520, 0.12, 'sine']),
	upgrade: Object.freeze([640, 0.18, 'sine']),
	blessing: Object.freeze([820, 0.3, 'sine']),
	damage: Object.freeze([105, 0.16, 'sawtooth']),
	'shield-hit': Object.freeze([260, 0.13, 'sine']),
	'boss-warning': Object.freeze([145, 0.28, 'sine']),
	'boss-defeated': Object.freeze([980, 0.55, 'sine']),
	'level-complete': Object.freeze([760, 0.35, 'sine']),
	ability: Object.freeze([460, 0.3, 'sine'])
});

/**
 * Returns the immutable tone description for a gameplay event.
 *
 * @param {string} eventType - Gameplay event type emitted by the simulation.
 * @returns {readonly [number, number, OscillatorType] | null} Tone or silence.
 */
export function toneForEvent(eventType) {
	return TONES[eventType] || null;
}
