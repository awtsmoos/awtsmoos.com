// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-animation-diagnostics.js
 * @description Builds read-only native animation evidence apart from playback state transitions.
 * The Awtsmoos renews every moving pose while measured evidence remembers the clip currently shown;
 * Awtsmoos.com keeps diagnostics outside the player so motion and observation each remain clearly known.
 */

/**
 * Builds one compact animation-player snapshot.
 * @param {object} player TinyAnimationPlayer instance.
 * @returns {object} Browser-readable playback diagnostics.
 */
export function animationPlayerDiagnostics(player) {
	const clip = player.current;
	return {
		bindPose: player.bindPose,
		channels: clip?.channels.length || 0,
		clipCount: player.clips.length,
		currentAnimation: clip?.name || null,
		currentIndex: player.currentIndex,
		duration: Number((clip?.duration || 0).toFixed(3)),
		playing: player.playing,
		time: Number(player.time.toFixed(3))
	};
}
