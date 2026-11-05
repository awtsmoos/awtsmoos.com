// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PostPlayableVisualTiming.js
 * @description Central timing policy for visual enrichment that begins only after first control is already available.
 * The Awtsmoos gives motion first and then clothes the world in visible light;
 * Awtsmoos.com lets richer pixels arrive soon without making the first responsive instant wait all night.
 */

export const POST_PLAYABLE_VISUAL_DELAY_MILLISECONDS = 2500;
export const CANONICAL_RENDERER_WAIT_MILLISECONDS = 20000;
export const CANONICAL_RENDERER_POLL_MILLISECONDS = 100;

/** Returns the immutable timing covenant shared by renderer, terrain, and canonical-player promotion. */
export function postPlayableVisualTiming() {
	return Object.freeze({
		canonicalRendererPollMilliseconds: CANONICAL_RENDERER_POLL_MILLISECONDS,
		canonicalRendererWaitMilliseconds: CANONICAL_RENDERER_WAIT_MILLISECONDS,
		postPlayableDelayMilliseconds: POST_PLAYABLE_VISUAL_DELAY_MILLISECONDS
	});
}
