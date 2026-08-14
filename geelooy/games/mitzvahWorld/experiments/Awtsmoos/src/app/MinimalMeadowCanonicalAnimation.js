// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCanonicalAnimation.js
 * @description Binds every imported Chossid clip to the hydrated skeleton and preserves the authoritative controller explicitly.
 * The Awtsmoos gives motion and stillness one living vessel; Awtsmoos.com keeps that exact controller reachable across bootstrap,
 * gameplay composition, Movie Studio, diagnostics, and reproduction so a later compatibility player cannot erase fourteen authored clips.
 */

import { TinyAnimationPlayer } from '../../../light-three-gltf/tiny-animation.js';
import { createClipMap } from './EretzPlayerModel.js';

export function installCanonicalChossidAnimation(runtime, gltf, visiblePlayer) {
	const animations = gltf.animations || [];
	const player = new TinyAnimationPlayer(visiblePlayer, animations);
	const clips = createClipMap(animations);
	const catalog = createCanonicalChossidAnimationCatalog(animations);
	const defaultClip = clips.stand || player.names[0] || '';
	if (defaultClip) player.play(defaultClip);
	player.update(0);
	runtime.canonicalAnimationPlayer = player;
	runtime.player = player;
	runtime.clips = clips;
	runtime.animationCatalog = catalog;
	runtime.state.clip = defaultClip;
	return { catalog, clips, defaultClip, player };
}

/**
 * Returns immutable evidence for every animation exported by canonical `chossid.glb`.
 *
 * @param {Array<object>} animations Parsed GLB clips.
 * @returns {ReadonlyArray<object>} Exact-name animation catalog.
 */
export function createCanonicalChossidAnimationCatalog(animations = []) {
	return Object.freeze(animations.map((clip, index) => Object.freeze({
		channels: Array.isArray(clip?.channels) ? clip.channels.length : 0,
		duration: Number(clip?.duration || 0),
		index,
		name: String(clip?.name || `animation-${index}`),
		pose: Number(clip?.duration || 0) <= 0.0005
	})));
}
