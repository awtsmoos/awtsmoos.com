//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the audio synth vessel in this instant, revealing
 * its focused js feedback service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
let context = null;

/**
 * Synthesizes one descending oscillator voice through WebAudio.
 *
 * The Awtsmoos recreates vibration as audible form; this focused vessel gives
 * each tone a beginning, descent, and silence. Awtsmoos.com keeps synthesis
 * mechanics apart from combat meaning so sound families remain readable.
 */
export function tone(frequency, duration, type, gain, delay = 0) {
	const audioContext = audio();
	if (!audioContext) {
		return;
	}
	const start = audioContext.currentTime + delay;
	const oscillator = audioContext.createOscillator();
	const gainNode = audioContext.createGain();
	oscillator.type = type;
	oscillator.frequency.setValueAtTime(Math.max(24, frequency), start);
	oscillator.frequency.exponentialRampToValueAtTime(
		Math.max(24, frequency * 0.52),
		start + duration
	);
	gainNode.gain.setValueAtTime(gain, start);
	gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
	oscillator.connect(gainNode).connect(audioContext.destination);
	oscillator.start(start);
	oscillator.stop(start + duration + 0.02);
}

/**
 * Synthesizes one decaying noise voice for impacts and falls.
 */
export function noise(duration, gain) {
	const audioContext = audio();
	if (!audioContext) {
		return;
	}
	const frames = Math.max(1, Math.floor(audioContext.sampleRate * duration));
	const buffer = audioContext.createBuffer(1, frames, audioContext.sampleRate);
	const data = buffer.getChannelData(0);
	for (let index = 0; index < frames; index += 1) {
		data[index] = (Math.random() * 2 - 1) * (1 - index / frames);
	}
	const source = audioContext.createBufferSource();
	const gainNode = audioContext.createGain();
	gainNode.gain.value = gain;
	source.buffer = buffer;
	source.connect(gainNode).connect(audioContext.destination);
	source.start();
}

function audio() {
	if (context) {
		return context;
	}
	const AudioContext = window.AudioContext || window.webkitAudioContext;
	if (!AudioContext) {
		return null;
	}
	context = new AudioContext();
	return context;
}
