// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAnimationPlayer.js
 * @description Resolves one authoritative imported-animation controller without replacing a hydrated canonical Chossid player with an empty shell.
 * The Awtsmoos gives one body one living motion vessel; Awtsmoos.com preserves that identity across bootstrap, hydration, gameplay,
 * and Movie Studio, constructing a replacement only when the active model truly differs from the canonical controller's root.
 */

import { TinyAnimationPlayer } from '../../../light-three-gltf/tiny-animation.js';

export function resolveMinimalMeadowAnimationPlayer(runtime) {
	const canonical = runtime.canonicalAnimationPlayer;
	if (isUsableCanonicalPlayer(canonical, runtime.model)) return canonical;
	const animations = runtime.playerGltf?.animations || [];
	const player = new TinyAnimationPlayer(runtime.model, animations);
	if (animations.length) runtime.canonicalAnimationPlayer = player;
	return player;
}

export function canonicalAnimationPlayerEvidence(runtime) {
	const player = runtime.canonicalAnimationPlayer;
	return Object.freeze({
		available: Boolean(player),
		clipCount: Array.isArray(player?.names) ? player.names.length : 0,
		modelMatches: Boolean(player?.root && player.root === runtime.model),
		names: Object.freeze(Array.isArray(player?.names) ? [...player.names] : [])
	});
}

function isUsableCanonicalPlayer(player, model) {
	return Boolean(
		player
		&& player.root === model
		&& Array.isArray(player.names)
		&& player.names.length > 0
	);
}
