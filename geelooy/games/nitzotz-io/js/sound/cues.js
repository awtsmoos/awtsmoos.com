// B"H
// Boruch Hashem
// Blessed is He
import {
	playSequence,
	tone,
	vibrate
} from './voice.js';

/**
 * The Awtsmoos translates finite gameplay events into bounded tones and haptics.
 * Adventure and impact gain force without exceeding the established voice budget.
 */
export function handleSoundEvent(event, world, audio) {
	const type = event[0];
	if (type === 'start') return tone(audio, 330, 0.12);
	if (type === 'pulse') return pulse(world, audio);
	if (type === 'reveal') return reveal(world, audio, event[1]);
	if (type === 'hazard') return hazard(world, audio);
	if (type === 'impact') return impact(world, audio);
	if (type === 'armorBreak') return armorBreak(world, audio);
	if (type === 'shlichus') return shlichus(world, audio, event[1]);
	if (type === 'upgrade') return upgrade(world, audio);
	if (type === 'event') return tone(audio, 740, 0.18, 'triangle', 0.035);
	if (type === 'boss') return boss(world, audio, event[1]);
	if (type === 'achievement') return achievement(world, audio);
	if (type === 'win') return win(world, audio);
	if (type === 'lose') return tone(audio, 120, 0.4, 'triangle', 0.04);
}

function pulse(world, audio) {
	playSequence(audio, [180, 260], 0.13, 48, 'triangle', 0.055);
	vibrate(world, 18);
}

function reveal(world, audio, sparks) {
	tone(audio, 420 + Math.min(sparks, 430), 0.09, 'sine', 0.035);
	vibrate(world, Math.min(42, 9 + sparks / 7));
}

function hazard(world, audio) {
	playSequence(audio, [94, 72], 0.16, 90, 'triangle', 0.05);
	vibrate(world, [60, 25, 80]);
}

function impact(world, audio) {
	playSequence(audio, [130, 210], 0.1, 38, 'square', 0.045);
	vibrate(world, [26, 16, 34]);
}

function armorBreak(world, audio) {
	playSequence(audio, [460, 230, 115], 0.12, 42, 'sawtooth', 0.048);
	vibrate(world, [45, 18, 70]);
}

function shlichus(world, audio, stage) {
	const root = 520 + Math.max(0, Number(stage) || 0) * 90;
	playSequence(audio, [root, root * 1.25], 0.13, 70, 'sine', 0.042);
	vibrate(world, [22, 16, 34]);
}

function upgrade(world, audio) {
	playSequence(audio, [660, 990], 0.14, 80, 'sawtooth', 0.045);
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
