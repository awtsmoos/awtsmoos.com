// B"H
// Boruch Hashem
// Blessed is He

const MAX_VOICES = 24;

/** Create one finite browser-audio vessel before user activation unlocks it. */
export function createAudioState() {
	return { context: null, ready: false, voices: 0 };
}

/** Unlock audio only after real user activation and preserve silent failure safety. */
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

/** Play a bounded sequence without exceeding the global voice ceiling. */
export function playSequence(
	audio,
	frequencies,
	duration,
	spacing,
	type = 'sine',
	gain = 0.05
) {
	frequencies.forEach((frequency, index) => {
		setTimeout(() => tone(audio, frequency, duration, type, gain), index * spacing);
	});
}

/** Play one finite oscillator and release every graph node after completion. */
export function tone(audio, frequency, duration, type = 'sine', gain = 0.05) {
	if (!audio.ready || audio.voices >= MAX_VOICES) return;
	const oscillator = audio.context.createOscillator();
	const amplifier = audio.context.createGain();
	audio.voices += 1;
	oscillator.type = type;
	oscillator.frequency.value = frequency;
	amplifier.gain.value = gain;
	oscillator.connect(amplifier);
	amplifier.connect(audio.context.destination);
	oscillator.onended = () => releaseVoice(audio, oscillator, amplifier);
	oscillator.start();
	amplifier.gain.exponentialRampToValueAtTime(
		0.001,
		audio.context.currentTime + duration
	);
	oscillator.stop(audio.context.currentTime + duration);
}

/** Vibrate only when the saved preference and browser activation allow it. */
export function vibrate(world, value) {
	const activated = navigator.userActivation?.hasBeenActive ?? true;
	if (world.save.haptics && activated && navigator.vibrate) navigator.vibrate(value);
}

function releaseVoice(audio, oscillator, amplifier) {
	oscillator.disconnect();
	amplifier.disconnect();
	audio.voices = Math.max(0, audio.voices - 1);
}
