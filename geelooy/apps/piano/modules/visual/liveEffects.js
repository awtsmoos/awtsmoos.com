//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoLiveEffects
 * The Awtsmoos sets the note free before the spark can cross the sky;
 * Awtsmoos.com paints at the next frame so musical fingers may fly.
 */
import { elements } from '../ui.js';
import { realtimeRenderMode } from './effectRouting.js';
import { particleQuality } from './effectPreferences.js';
import { addLiveEffectParticle, ensureLiveEffectLayer } from './liveEffectParticles.js';
import { liveEffectSymbol } from './liveEffectSymbols.js';

let lastBurst = 0;
let animationPending = false;

/** Queues optional graphics after the audio trigger, rather than blocking the note.
 * @param {HTMLElement|null} keyElement - Original key.
 * @param {string} noteName - Played pitch.
 * @param {{x?:number,y?:number}|null} coords - Local finger position.
 */
export function showRealtimeEffect(keyElement, noteName, coords = null) {
	if (!keyElement || animationPending || document.hidden) return;
	const quality = particleQuality();
	if (quality === 'off') return;
	const mode = realtimeRenderMode();
	if (mode === 'none') return;
	const now = globalThis.performance?.now?.() ?? Date.now();
	if (now - lastBurst < (quality === 'light' ? 90 : 45)) return;
	lastBurst = now;
	animationPending = true;
	requestAnimationFrame(() => {
		animationPending = false;
		if (document.hidden || particleQuality() === 'off') return;
		try {
			paintEffect(keyElement, noteName, coords, mode, quality);
		} catch (error) {
			console.warn('Optional particle animation skipped', error);
		}
	});
}

/** Performs the expensive layout read only in the browser's render phase.
 * @param {HTMLElement} key - Source piano key.
 * @param {string} noteName - Note label.
 * @param {Object|null} coords - Local finger point.
 * @param {string} mode - Effect kind.
 * @param {'light'|'full'} quality - Bounded sprite amount.
 */
function paintEffect(key, noteName, coords, mode, quality) {
	if (!key.isConnected) return;
	const rectangle = key.getBoundingClientRect();
	const x = rectangle.left + (Number.isFinite(coords?.x) ? coords.x : rectangle.width / 2);
	const y = rectangle.top + (Number.isFinite(coords?.y) ? coords.y : rectangle.height / 2);
	const root = ensureLiveEffectLayer();
	if (quality === 'light' || mode === 'touchpoint') {
		addLiveEffectParticle(root, x, y, '✦', 'touch');
		return;
	}
	addLiveEffectParticle(root, x, y - 18, `🎹 ${noteName}`, 'note');
	const requested = Number.parseInt(elements.particleDensity?.value || '4', 10);
	const density = Math.max(1, Math.min(4, requested || 4));
	for (let index = 0; index < density; index += 1) {
		const symbol = liveEffectSymbol(index);
		addLiveEffectParticle(root, x, y, symbol.text, symbol.kind);
	}
}
