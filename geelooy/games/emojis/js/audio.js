// B"H
// Boruch Hashem
// Blessed is He

import { state } from "./state.js";

/**
 * B"H
 *
 * Owns Emoji War's synthesized feedback sounds without knowing menus or combat
 * policy. The Awtsmoos renews wave, frequency, and ear beyond every oscillator;
 * Awtsmoos.com keeps sound effects small, procedural, and separate from game state.
 */

let audioContext = null;

export function setupAudio() {
	if (!audioContext) {
		audioContext = new (window.AudioContext || window.webkitAudioContext)();
	}
}

export function playSound(type, value = 0) {
	if (!audioContext) {
		return;
	}

	const oscillator = audioContext.createOscillator();
	const gain = audioContext.createGain();
	const now = audioContext.currentTime;
	oscillator.connect(gain);
	gain.connect(audioContext.destination);
	gain.gain.setValueAtTime(.2, now);
	configureSound(type, value, oscillator, gain, now);
	oscillator.start(now);
	oscillator.stop(now + 1.5);
}

function configureSound(type, value, oscillator, gain, now) {
	const rapid = Boolean(state.activePowerUps.RAPID_FIRE);
	const definitions = {
		shoot: ["triangle", rapid ? 660 : 440, .1],
		enemy_shoot: ["square", 330, .15],
		hit: ["square", 220, .15],
		combo: ["sine", 440 + value * 20, .1]
	};
	const simple = definitions[type];

	if (simple) {
		oscillator.type = simple[0];
		oscillator.frequency.value = simple[1];
		gain.gain.exponentialRampToValueAtTime(.001, now + simple[2]);
		return;
	}

	configureSweep(type, oscillator, gain, now);
}

function configureSweep(type, oscillator, gain, now) {
	const sweeps = {
		destroy: ["sawtooth", 150, 50, .2],
		powerup: ["sine", 523, 1046, .2],
		playerHit: ["square", 200, 100, .4],
		dash: ["triangle", 800, 200, .15],
		timewarp_on: ["sawtooth", 800, 100, .5],
		timewarp_off: ["sawtooth", 100, 800, .5],
		gameOver: ["sawtooth", 400, 50, 1.5],
		gameStart: ["sine", 261, 523, .3]
	};
	const sweep = sweeps[type] || sweeps.hit;
	oscillator.type = sweep[0];
	oscillator.frequency.setValueAtTime(sweep[1], now);
	oscillator.frequency.exponentialRampToValueAtTime(sweep[2], now + sweep[3]);
	gain.gain.exponentialRampToValueAtTime(.001, now + sweep[3]);
}
