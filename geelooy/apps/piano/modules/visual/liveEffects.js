//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoLiveEffects
 * @description
 * The Awtsmoos lets touch become a brief spark without making light the master of sound;
 * Awtsmoos.com keeps realtime orchestration coordinate-safe, so MIDI, keys, and pointers may all play around.
 */

import { elements } from '../ui.js';
import { realtimeRenderMode } from './effectRouting.js';
import {
	addLiveEffectParticle,
	ensureLiveEffectLayer
} from './liveEffectParticles.js';
import { liveEffectSymbol } from './liveEffectSymbols.js';

/**
 * @description Renders one ephemeral realtime effect, safely centering coordinate-less keyboard or MIDI notes on the visible key.
 * @param {HTMLElement|null} keyElement - Primary visible piano key receiving the effect.
 * @param {string} noteName - Scientific note label displayed by full note effects.
 * @param {{x:number,y:number}|null} [coords=null] - Optional pointer-local coordinates; null uses the key center.
 * @returns {void}
 */
export function showRealtimeEffect(keyElement, noteName, coords = null) {
	const mode = realtimeRenderMode();

	if (mode === 'none' || !keyElement) {
		return;
	}

	const root = ensureLiveEffectLayer();
	const point = effectPoint(keyElement, coords);

	if (mode === 'touchpoint') {
		addLiveEffectParticle(root, point.x, point.y, '•', 'touch');
		return;
	}

	addLiveEffectParticle(root, point.x, point.y - 20, `🎹 ${noteName} ✨`, 'note');
	const density = effectDensity();

	for (let index = 0; index < density; index += 1) {
		const symbol = liveEffectSymbol(index);
		addLiveEffectParticle(root, point.x, point.y, symbol.text, symbol.kind);
	}
}

/**
 * @description Resolves page coordinates from optional key-local input, using the visible key center whenever pointer coordinates are absent.
 * @param {HTMLElement} keyElement - Visible piano key whose client rectangle anchors the effect.
 * @param {{x:number,y:number}|null} coords - Optional coordinates relative to the key.
 * @returns {{x:number,y:number}} Page-space particle origin.
 */
function effectPoint(keyElement, coords) {
	const box = keyElement.getBoundingClientRect();
	const localX = Number.isFinite(coords?.x) ? coords.x : box.width / 2;
	const localY = Number.isFinite(coords?.y) ? coords.y : box.height / 2;

	return {
		x: box.left + localX,
		y: box.top + localY
	};
}

/**
 * @description Reads and bounds the live particle-density control for one realtime effect burst.
 * @returns {number} Integer particle count from two through eighteen.
 */
function effectDensity() {
	const value = Number.parseInt(elements.particleDensity?.value || '9', 10);
	return Math.max(2, Math.min(18, value));
}
