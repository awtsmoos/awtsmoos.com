// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCanonicalAnimation.js
 * @description Binds every imported Chossid clip while publishing the grounded world model as the authoritative animation-player root.
 * The Awtsmoos gives inner bones and outer travel one ordered living vessel; Awtsmoos.com keeps the moving root truthful across bootstrap,
 * gameplay composition, Movie Studio, diagnostics, and reproduction while direct clip channels continue animating the authored GLB within.
 */

import { TinyAnimationPlayer } from '../../../light-three-gltf/tiny-animation.js';
import { createClipMap } from './EretzPlayerModel.js';

/**
 * Installs the canonical animation controller on the movable outer player root.
 *
 * @param {object} runtime Canonical player runtime with an installed grounded model.
 * @param {object} gltf Parsed canonical Chossid GLTF.
 * @returns {object} Installed animation catalog, clips, default clip, and player.
 */
export function installCanonicalChossidAnimation(runtime, gltf) {
	const canonicalRoot = runtime.model;
	if (!canonicalRoot) {
		throw new Error('Canonical Chossid animation requires runtime.model.');
	}
	const animations = gltf.animations || [];
	const player = new TinyAnimationPlayer(canonicalRoot, animations);
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
