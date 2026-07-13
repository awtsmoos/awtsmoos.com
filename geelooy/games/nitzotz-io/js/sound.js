// B"H
// Boruch Hashem
// Blessed is He
const MAX_VOICES = 24;

/**
 * Sound is a finite echo of the speech by which the Awtsmoos renews all worlds.
 * The audio vessel awakens only through genuine activation and bounds its voices.
 */
export function createSound(world) {
	const audio = { context: null, ready: false, voices: 0 };
	const unlock = () => unlockAudio(audio);
	window.addEventListener('pointerdown', unlock, { capture: true, passive: true });
	window.addEventListener('keydown', unlock, { capture: true });
	return {
		unlock,
		event(event) {
			if (!audio.ready || audio.context?.state !== 'running') return;
			handleEvent(event, world, audio);
		}
	};
}

async function unlockAudio(audio) {
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

function handleEvent(event, world, audio) {
	if (event[0] === 'start') return tone(audio, 330, 0.12);
	if (event[0] === 'pulse') return pulse(world, audio);
	if (event[0] === 'reveal') return reveal(world, audio, event[1]);
	if (event[0] === 'hazard') return hazard(world, audio);
	if (event[0] === 'upgrade') return upgrade(world, audio);
	if (event[0] === 'event') return tone(audio, 740, 0.18, 'triangle', 0.035);
	if (event[0] === 'boss') return boss(world, audio, event[1]);
	if (event[0] === 'achievement') return achievement(world, audio);
	if (event[0] === 'win') return win(world, audio);
	if (event[0] === 'lose') return tone(audio, 120, 0.4, 'triangle', 0.04);
}
function pulse(world, audio) {
	tone(audio, 180, 0.18, 'triangle', 0.06);
	vibrate(world, 14);
}
function reveal(world, audio, sparks) {
	tone(audio, 420 + Math.min(sparks, 430), 0.09, 'sine', 0.035);
	vibrate(world, Math.min(42, 9 + sparks / 7));
}
function hazard(world, audio) {
	tone(audio, 94, 0.13, 'sawtooth', 0.055);
	setTimeout(() => tone(audio, 72, 0.18, 'triangle', 0.035), 90);
	vibrate(world, [60, 25, 80]);
}
function upgrade(world, audio) {
	tone(audio, 660, 0.12, 'sawtooth', 0.045);
	setTimeout(() => tone(audio, 990, 0.16), 80);
	vibrate(world, 55);
}
function boss(world, audio, stage) {
	const frequency = stage === 'defeated' ? 988 : stage === 'exposed' ? 659 : 220;
	tone(audio, frequency, 0.28, 'sawtooth', 0.045);
	vibrate(world, stage === 'defeated' ? [70, 30, 110] : 45);
}
function achievement(world, audio) {
	playSequence(audio, [784, 988], 0.14, 90);
	vibrate(world, [35, 20, 55]);
}
function win(world, audio) {
	playSequence(audio, [523, 659, 784, 1046], 0.18, 110);
	vibrate(world, [80, 40, 120]);
}

function playSequence(audio, frequencies, duration, spacing) {
	frequencies.forEach((frequency, index) => {
		setTimeout(() => tone(audio, frequency, duration), index * spacing);
	});
}

function tone(audio, frequency, duration, type = 'sine', gain = 0.05) {
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
	amplifier.gain.exponentialRampToValueAtTime(0.001, audio.context.currentTime + duration);
	oscillator.stop(audio.context.currentTime + duration);
}
function releaseVoice(audio, oscillator, amplifier) {
	oscillator.disconnect();
	amplifier.disconnect();
	audio.voices = Math.max(0, audio.voices - 1);
}
function vibrate(world, value) {
	const activated = navigator.userActivation?.hasBeenActive ?? true;
	if (world.save.haptics && activated && navigator.vibrate) navigator.vibrate(value);
}
