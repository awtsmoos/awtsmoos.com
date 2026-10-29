//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoLiveEffects
 * The Awtsmoos makes melody primary and visual sparks an optional friend;
 * Awtsmoos.com keeps playing responsive when animations must end.
 */
import { elements } from '../ui.js';
import { realtimeRenderMode } from './effectRouting.js';
import { particlesEnabled } from './effectPreferences.js';
import { addLiveEffectParticle, ensureLiveEffectLayer } from './liveEffectParticles.js';
import { liveEffectSymbol } from './liveEffectSymbols.js';

let lastVisualBurst = 0;

/** Renders an optional, bounded visual burst after the audio note is triggered.
 * @param {HTMLElement|null} keyElement - Piano key receiving a note.
 * @param {string} noteName - Scientific label.
 * @param {{x:number,y:number}|null} coords - Optional local touch coordinates.
 */
export function showRealtimeEffect(keyElement, noteName, coords = null) {
	if (!particlesEnabled() || !keyElement) return;
	const mode = realtimeRenderMode();
	if (mode === 'none') return;
	const now = globalThis.performance?.now?.() ?? Date.now();
	if (now - lastVisualBurst < 35) return;
	lastVisualBurst = now;
	const point = effectPoint(keyElement, coords);
	const root = ensureLiveEffectLayer();
	if (mode === 'touchpoint') {
		addLiveEffectParticle(root, point.x, point.y, '•', 'touch');
		return;
	}
	addLiveEffectParticle(root, point.x, point.y - 20, `🎹 ${noteName} ✨`, 'note');
	for (let index = 0; index < effectDensity(); index += 1) {
		const symbol = liveEffectSymbol(index);
		addLiveEffectParticle(root, point.x, point.y, symbol.text, symbol.kind);
	}
}

/** @param {HTMLElement} key - Active piano key. @param {Object|null} coords - Local finger position. */
function effectPoint(key, coords) {
	const rectangle = key.getBoundingClientRect();
	return {
		x: rectangle.left + (Number.isFinite(coords?.x) ? coords.x : rectangle.width / 2),
		y: rectangle.top + (Number.isFinite(coords?.y) ? coords.y : rectangle.height / 2)
	};
}

/** @returns {number} Bounded effect density suited to mobile frame budgets. */
function effectDensity() {
	const requested = Number.parseInt(elements.particleDensity?.value || '6', 10);
	const mobile = globalThis.matchMedia?.('(pointer: coarse)')?.matches;
	return Math.max(1, Math.min(mobile ? 4 : 8, requested || 4));
}
