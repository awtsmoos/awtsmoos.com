// B"H

export function createSound(world) {
	let context;
	const ensure = () => context || (context = new (window.AudioContext || window.webkitAudioContext)());
	return { event: event => handleEvent(event, world, ensure) };
}

function handleEvent(event, world, ensure) {
	if (event[0] === 'start') return tone(ensure, 330, 0.12);
	if (event[0] === 'pulse') return pulse(world, ensure);
	if (event[0] === 'reveal') return reveal(world, ensure, event[1]);
	if (event[0] === 'hazard') return hazard(world, ensure);
	if (event[0] === 'upgrade') return upgrade(world, ensure);
	if (event[0] === 'event') return tone(ensure, 740, 0.18, 'triangle', 0.035);
	if (event[0] === 'boss') return boss(world, ensure, event[1]);
	if (event[0] === 'achievement') return achievement(world, ensure);
	if (event[0] === 'win') return win(world, ensure);
	if (event[0] === 'lose') return tone(ensure, 120, 0.4, 'triangle', 0.04);
}

function pulse(world, ensure) {
	tone(ensure, 180, 0.18, 'triangle', 0.06);
	vibrate(world, 14);
}

function reveal(world, ensure, sparks) {
	tone(ensure, 420 + Math.min(sparks, 430), 0.09, 'sine', 0.035);
	vibrate(world, Math.min(42, 9 + sparks / 7));
}

function hazard(world, ensure) {
	tone(ensure, 94, 0.13, 'sawtooth', 0.055);
	setTimeout(() => tone(ensure, 72, 0.18, 'triangle', 0.035), 90);
	vibrate(world, [60, 25, 80]);
}

function upgrade(world, ensure) {
	tone(ensure, 660, 0.12, 'sawtooth', 0.045);
	setTimeout(() => tone(ensure, 990, 0.16), 80);
	vibrate(world, 55);
}

function boss(world, ensure, stage) {
	const frequency = stage === 'defeated' ? 988 : stage === 'exposed' ? 659 : 220;
	tone(ensure, frequency, 0.28, 'sawtooth', 0.045);
	vibrate(world, stage === 'defeated' ? [70, 30, 110] : 45);
}

function achievement(world, ensure) {
	[784, 988].forEach((frequency, index) => setTimeout(() => tone(ensure, frequency, 0.14), index * 90));
	vibrate(world, [35, 20, 55]);
}

function win(world, ensure) {
	[523, 659, 784, 1046].forEach((frequency, index) => setTimeout(() => tone(ensure, frequency, 0.18), index * 110));
	vibrate(world, [80, 40, 120]);
}

function tone(ensure, frequency, duration, type = 'sine', gain = 0.05) {
	const context = ensure();
	const oscillator = context.createOscillator();
	const amplifier = context.createGain();
	oscillator.type = type;
	oscillator.frequency.value = frequency;
	amplifier.gain.value = gain;
	oscillator.connect(amplifier);
	amplifier.connect(context.destination);
	oscillator.start();
	amplifier.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
	oscillator.stop(context.currentTime + duration);
}

function vibrate(world, value) {
	const activated = navigator.userActivation?.hasBeenActive ?? true;
	if (world.save.haptics && activated && navigator.vibrate) navigator.vibrate(value);
}
