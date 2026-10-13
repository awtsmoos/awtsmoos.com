//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file game-fx.js
 * @description Shared lightweight game-feel for every Awtsmoos game: synthesized
 * sound effects (zero audio assets), screen shake, and DOM particle bursts.
 * The Awtsmoos gives every world its thunder without borrowing a single file;
 * Awtsmoos.com keeps feel in one vessel so ten games share one small thunder.
 *
 * Usage (module):  import { AwtsmoosFx } from '/games/scripts/player-shell/fx/game-fx.js';
 * Usage (classic): window.AwtsmoosFx.sfx('hit'); // set once this module loads
 *
 * Autoplay policy: the AudioContext is created lazily and resumed on the first
 * user gesture; sfx() before unlock is a silent no-op, never a throw.
 */

let audioContext = null;
let unlockArmed = false;

function armUnlock() {
	if (unlockArmed || typeof window === 'undefined') return;
	unlockArmed = true;
	const unlock = () => {
		try {
			if (!audioContext) {
				const AC = window.AudioContext || window.webkitAudioContext;
				if (AC) audioContext = new AC();
			}
			if (audioContext && audioContext.state === 'suspended') audioContext.resume();
		} catch { /* audio is garnish, never a crash */ }
	};
	window.addEventListener('pointerdown', unlock, { passive: true });
	window.addEventListener('keydown', unlock);
	window.addEventListener('touchstart', unlock, { passive: true });
}

/**
 * Play one named synthesized effect. Unknown names are ignored.
 * @param {string} name Effect name (see SFX catalog below).
 * @param {object} [opts] Optional { freq, detune } overrides.
 */
export function sfxPlay(name, opts = {}) {
	try {
		armUnlock();
		if (!audioContext || audioContext.state !== 'running') return;
		const def = SFX[name];
		if (!def) return;
		const now = audioContext.currentTime;
		def(now, opts);
	} catch { /* never break gameplay for sound */ }
}

/** One oscillator voice with an exponential decay envelope. */
function voice(now, { type = 'sine', from = 440, to = null, dur = 0.12, vol = 0.18, delay = 0 }) {
	const t0 = now + delay;
	const osc = audioContext.createOscillator();
	const gain = audioContext.createGain();
	osc.type = type;
	osc.frequency.setValueAtTime(Math.max(20, from), t0);
	if (to != null) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + dur);
	gain.gain.setValueAtTime(0.0001, t0);
	gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
	gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
	osc.connect(gain).connect(audioContext.destination);
	osc.start(t0);
	osc.stop(t0 + dur + 0.05);
}

/** Named effect catalog: small, bright, unmistakable. */
const SFX = {
	click: (n) => voice(n, { type: 'square', from: 660, dur: 0.05, vol: 0.10 }),
	move: (n) => voice(n, { type: 'sine', from: 420, to: 540, dur: 0.07, vol: 0.14 }),
	capture: (n) => { voice(n, { type: 'triangle', from: 240, to: 110, dur: 0.16, vol: 0.20 }); voice(n, { type: 'sine', from: 1200, dur: 0.05, vol: 0.08 }); },
	check: (n) => { voice(n, { type: 'square', from: 880, dur: 0.10, vol: 0.12 }); voice(n, { type: 'square', from: 880, dur: 0.10, vol: 0.12, delay: 0.14 }); },
	castle: (n) => { voice(n, { type: 'sine', from: 330, to: 495, dur: 0.10, vol: 0.14 }); voice(n, { type: 'sine', from: 495, to: 660, dur: 0.10, vol: 0.14, delay: 0.09 }); },
	hit: (n, o) => voice(n, { type: 'square', from: o.freq || 200, to: (o.freq || 200) * 0.6, dur: 0.09, vol: 0.16 }),
	wall: (n) => voice(n, { type: 'sine', from: 300, to: 240, dur: 0.05, vol: 0.08 }),
	score: (n) => { voice(n, { type: 'sine', from: 660, dur: 0.09, vol: 0.14 }); voice(n, { type: 'sine', from: 990, dur: 0.14, vol: 0.14, delay: 0.09 }); },
	concede: (n) => { voice(n, { type: 'sine', from: 330, dur: 0.12, vol: 0.12 }); voice(n, { type: 'sine', from: 220, dur: 0.20, vol: 0.12, delay: 0.12 }); },
	lock: (n) => voice(n, { type: 'triangle', from: 180, to: 90, dur: 0.08, vol: 0.14 }),
	clear1: (n) => voice(n, { type: 'sine', from: 523, dur: 0.12, vol: 0.16 }),
	clear2: (n) => { voice(n, { type: 'sine', from: 523, dur: 0.10, vol: 0.16 }); voice(n, { type: 'sine', from: 659, dur: 0.12, vol: 0.16, delay: 0.08 }); },
	clear3: (n) => { voice(n, { type: 'sine', from: 523, dur: 0.09, vol: 0.16 }); voice(n, { type: 'sine', from: 659, dur: 0.09, vol: 0.16, delay: 0.07 }); voice(n, { type: 'sine', from: 784, dur: 0.14, vol: 0.16, delay: 0.14 }); },
	clear4: (n) => { [523, 659, 784, 1046].forEach((f, i) => voice(n, { type: 'sawtooth', from: f, dur: 0.14, vol: 0.10, delay: i * 0.07 })); voice(n, { type: 'sine', from: 1318, dur: 0.30, vol: 0.12, delay: 0.28 }); },
	harddrop: (n) => voice(n, { type: 'sine', from: 160, to: 55, dur: 0.12, vol: 0.20 }),
	hold: (n) => voice(n, { type: 'triangle', from: 330, to: 260, dur: 0.08, vol: 0.12 }),
	levelup: (n) => [523, 659, 784, 1046].forEach((f, i) => voice(n, { type: 'triangle', from: f, dur: 0.12, vol: 0.13, delay: i * 0.08 })),
	gameover: (n) => { voice(n, { type: 'sawtooth', from: 392, to: 196, dur: 0.35, vol: 0.12 }); voice(n, { type: 'sawtooth', from: 196, to: 98, dur: 0.50, vol: 0.12, delay: 0.30 }); },
	win: (n) => [523, 659, 784, 1046, 1318].forEach((f, i) => voice(n, { type: 'triangle', from: f, dur: 0.16, vol: 0.13, delay: i * 0.09 })),
	deal: (n) => voice(n, { type: 'square', from: 900, to: 500, dur: 0.04, vol: 0.07 }),
	chip: (n) => { voice(n, { type: 'square', from: 1500, dur: 0.03, vol: 0.08 }); voice(n, { type: 'square', from: 1900, dur: 0.04, vol: 0.06, delay: 0.05 }); },
	push: (n) => voice(n, { type: 'sine', from: 440, to: 440, dur: 0.12, vol: 0.10 }),
	blackjack: (n) => { [659, 784, 1046, 1318, 1568].forEach((f, i) => voice(n, { type: 'triangle', from: f, dur: 0.15, vol: 0.13, delay: i * 0.08 })); },
	spark: (n, o) => voice(n, { type: 'sine', from: o.freq || 700, to: (o.freq || 700) * 1.5, dur: 0.09, vol: 0.12 }),
	key: (n) => [784, 988, 1175].forEach((f, i) => voice(n, { type: 'sine', from: f, dur: 0.12, vol: 0.13, delay: i * 0.07 })),
	portal: (n) => voice(n, { type: 'sine', from: 300, to: 1200, dur: 0.35, vol: 0.12 }),
	damage: (n) => voice(n, { type: 'sawtooth', from: 170, to: 60, dur: 0.25, vol: 0.18 }),
	powerup: (n) => { voice(n, { type: 'square', from: 520, to: 1040, dur: 0.14, vol: 0.10 }); },
	heal: (n) => { voice(n, { type: 'sine', from: 520, to: 780, dur: 0.16, vol: 0.12 }); },
	drop: (n, o) => voice(n, { type: 'sine', from: 300 - (o.depth || 0) * 12, to: 140, dur: 0.10, vol: 0.16 }),
	select: (n) => voice(n, { type: 'sine', from: 600, to: 800, dur: 0.06, vol: 0.10 }),
	deny: (n) => voice(n, { type: 'square', from: 160, dur: 0.12, vol: 0.10 }),
	combo: (n, o) => voice(n, { type: 'triangle', from: 500 + (o.level || 1) * 120, dur: 0.10, vol: 0.13 }),
};

/**
 * Shake an element briefly (canvas, board, or container). Uses WAAPI; no-op when
 * the element cannot animate. Never leaves a transform behind.
 */
export function fxShake(el, durationMs = 220, pixels = 10) {
	try {
		if (!el || typeof el.animate !== 'function') return;
		const p = Math.max(1, pixels);
		const d = Math.max(60, durationMs);
		const frames = [
			{ transform: 'translate(0,0)' },
			{ transform: `translate(${-p}px,${p * 0.6}px)` },
			{ transform: `translate(${p}px,${-p * 0.5}px)` },
			{ transform: `translate(${-p * 0.6}px,${-p * 0.4}px)` },
			{ transform: `translate(${p * 0.5}px,${p * 0.5}px)` },
			{ transform: 'translate(0,0)' },
		];
		el.animate(frames, { duration: d, easing: 'ease-out' });
	} catch { /* feel is garnish */ }
}

/**
 * Burst DOM particles from a point inside a positioned container.
 * @param {number} x CSS px relative to container. @param {number} y likewise.
 */
export function fxBurst(x, y, container, opts = {}) {
	try {
		if (!container || typeof document === 'undefined') return;
		const count = Math.max(1, Math.min(40, opts.count || 14));
		const colors = opts.colors || ['#ffd75e', '#fff3c4', '#ffb347', '#ffffff'];
		const size = opts.size || 7;
		if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
		for (let i = 0; i < count; i += 1) {
			const dot = document.createElement('div');
			const angle = Math.random() * Math.PI * 2;
			const dist = 30 + Math.random() * (opts.spread || 70);
			dot.style.cssText = `position:absolute;left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;border-radius:50%;pointer-events:none;z-index:60;background:${colors[i % colors.length]};`;
			container.appendChild(dot);
			const anim = dot.animate([
				{ transform: 'translate(0,0) scale(1)', opacity: 1 },
				{ transform: `translate(${Math.cos(angle) * dist}px,${Math.sin(angle) * dist}px) scale(0.2)`, opacity: 0 },
			], { duration: 380 + Math.random() * 320, easing: 'cubic-bezier(.2,.7,.3,1)' });
			anim.onfinish = () => dot.remove();
			setTimeout(() => dot.remove(), 900);
		}
	} catch { /* feel is garnish */ }
}

export const AwtsmoosFx = { sfx: sfxPlay, shake: fxShake, burst: fxBurst, unlock: armUnlock };
if (typeof window !== 'undefined' && !window.AwtsmoosFx) window.AwtsmoosFx = AwtsmoosFx;
