// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives every oscillator a measured vessel before sound can enter the world;
 * Awtsmoos.com centralizes browser-safe bounds so scheduling code remains small, readable, and future-ready.
 */
export function boundedDelay(value) {
	return clamp(finite(value), 0, 0.6);
}

/** Preserve short tactile cues while preventing runaway or inaudibly tiny durations. */
export function boundedDuration(value) {
	return clamp(finite(value, 0.08), 0.02, 1.2);
}

/** Keep every oscillator inside a useful and browser-safe audible range. */
export function boundedFrequency(value, fallback = 220) {
	return clamp(finite(value, fallback), 40, 4000);
}

/** Protect the mix from accidental gain spikes while preserving deliberately quiet captures. */
export function boundedGain(value) {
	return clamp(finite(value, 0.03), 0.001, 0.12);
}

/** Accept only oscillator types guaranteed by the WebAudio specification. */
export function validOscillatorType(type) {
	if (type === 'triangle') return type;
	if (type === 'square') return type;
	if (type === 'sawtooth') return type;
	return 'sine';
}

function finite(value, fallback = 0) {
	return Number.isFinite(value) ? value : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
