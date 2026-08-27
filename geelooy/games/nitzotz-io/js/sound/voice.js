// B"H
// Boruch Hashem
// Blessed is He
import {
	boundedDelay,
	boundedDuration,
	boundedFrequency,
	boundedGain,
	validOscillatorType
} from './voiceBounds.js';

const MAX_VOICES = 24;

/**
 * The Awtsmoos lets browser oscillators appear only after human intention unlocks them;
 * Awtsmoos.com schedules bounded voices against AudioContext time so rhythm stays precise without timer churn.
 */
export function createAudioState() {
	return { context: null, ready: false, voices: 0 };
}

/** Unlock audio after real user activation while preserving silent failure safety. */
export async function unlockAudio(audio) {
	const activation = navigator.userActivation;
	if (activation && !activation.isActive && !activation.hasBeenActive) return;
	if (!audio.context) {
		const AudioContextClass = window.AudioContext || window.webkitAudioContext;
		if (!AudioContextClass) return;
		audio.context = new AudioContextClass();
	}
	try {
		await audio.context.resume();
		audio.ready = audio.context.state === 'running';
	} catch {
		audio.ready = false;
	}
}

/** Schedule one ordered sequence directly on the audio clock rather than through JavaScript timers. */
export function playSequence(
	audio,
	frequencies,
	duration,
	spacing,
	type = 'sine',
	gain = 0.05
) {
	const spacingSeconds = Math.max(0, Number.isFinite(spacing) ? spacing / 1000 : 0);
	frequencies.forEach((frequency, index) => {
		sweepTone(audio, frequency, frequency, duration, type, gain, index * spacingSeconds);
	});
}

/** Preserve the original tone API as a constant-pitch scheduled voice. */
export function tone(audio, frequency, duration, type = 'sine', gain = 0.05) {
	return sweepTone(audio, frequency, frequency, duration, type, gain, 0);
}

/**
 * Schedule one finite swept oscillator and release every graph node after completion.
 * Frequency, gain, timing, and type are bounded before they enter WebAudio.
 */
export function sweepTone(
	audio,
	frequency,
	endFrequency,
	duration,
	type = 'sine',
	gain = 0.05,
	delay = 0
) {
	if (!audio.ready || !audio.context || audio.voices >= MAX_VOICES) return false;
	const context = audio.context;
	const startAt = context.currentTime + boundedDelay(delay);
	const durationSeconds = boundedDuration(duration);
	const endAt = startAt + durationSeconds;
	const startFrequency = boundedFrequency(frequency);
	const finishFrequency = boundedFrequency(endFrequency, startFrequency);
	const voiceGain = boundedGain(gain);
	const oscillator = context.createOscillator();
	const amplifier = context.createGain();
	audio.voices += 1;
	oscillator.type = validOscillatorType(type);
	oscillator.frequency.setValueAtTime(startFrequency, startAt);
	if (Math.abs(finishFrequency - startFrequency) > 0.01) {
		oscillator.frequency.exponentialRampToValueAtTime(finishFrequency, endAt);
	}
	const attackEnd = startAt + Math.min(0.012, durationSeconds * 0.2);
	amplifier.gain.setValueAtTime(0.001, startAt);
	amplifier.gain.exponentialRampToValueAtTime(voiceGain, attackEnd);
	amplifier.gain.exponentialRampToValueAtTime(0.001, endAt);
	oscillator.connect(amplifier);
	amplifier.connect(context.destination);
	oscillator.onended = () => releaseVoice(audio, oscillator, amplifier);
	oscillator.start(startAt);
	oscillator.stop(endAt);
	return true;
}

/** Vibrate only when the saved preference and browser activation allow it. */
export function vibrate(world, value) {
	const activated = navigator.userActivation?.hasBeenActive ?? true;
	if (world.save?.haptics && activated && navigator.vibrate) {
		navigator.vibrate(value);
	}
}

function releaseVoice(audio, oscillator, amplifier) {
	oscillator.disconnect();
	amplifier.disconnect();
	audio.voices = Math.max(0, audio.voices - 1);
}
