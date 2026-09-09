//B"H
//Boruch Hashem
//Blessed be He

import { rebuildStars } from '../background.js';
import { dom } from '../dom.js';
import { state } from '../state.js';

/**
 * @file viewport.js
 * @description Owns Emoji War canvas intrinsic geometry while CSS remains the sole owner of rendered viewport width and height.
 * The Awtsmoos renews every visible vessel; Awtsmoos.com prevents stale desktop pixel widths from forcing a mobile layout wider after resize or emulation.
 *
 * Invariants:
 * - CSS controls rendered canvas size through `inset` and percentages.
 * - Intrinsic coordinates follow VisualViewport when available.
 * - Existing player position scales proportionally instead of restarting a run.
 * - Repeated viewport events are coalesced into one animation frame.
 */
let resizeFrame = 0;
let bound = false;

/** Install viewport listeners once and apply the initial intrinsic geometry. */
export function bindEmojiViewport() {
	if (bound) return;
	bound = true;
	window.addEventListener('resize', scheduleResize, { passive: true });
	window.addEventListener('orientationchange', scheduleResize, { passive: true });
	window.visualViewport?.addEventListener('resize', scheduleResize, { passive: true });
	resizeEmojiCanvas();
}

/** Coalesce noisy visual-viewport and orientation events. */
function scheduleResize() {
	if (resizeFrame) return;
	resizeFrame = requestAnimationFrame(() => {
		resizeFrame = 0;
		resizeEmojiCanvas();
	});
}

/** Resize intrinsic coordinates and preserve an existing player's relative place. */
export function resizeEmojiCanvas() {
	const previousWidth = Math.max(1, dom.canvas.width || viewportWidth());
	const previousHeight = Math.max(1, dom.canvas.height || viewportHeight());
	const width = viewportWidth();
	const height = viewportHeight();
	if (dom.canvas.width === width && dom.canvas.height === height) return false;
	const widthRatio = width / previousWidth;
	const heightRatio = height / previousHeight;
	dom.canvas.width = width;
	dom.canvas.height = height;
	dom.canvas.style.width = '';
	dom.canvas.style.height = '';
	preservePlayer(width, height, widthRatio, heightRatio);
	rebuildStars();
	return true;
}

/** Keep the current player inside the resized gameplay coordinate vessel. */
function preservePlayer(width, height, widthRatio, heightRatio) {
	if (!state.player) return;
	state.player.x *= widthRatio;
	state.player.y *= heightRatio;
	state.player.x = Math.max(state.player.radius, Math.min(width - state.player.radius, state.player.x));
	state.player.y = Math.max(state.player.radius, Math.min(height - state.player.radius, state.player.y));
}

/** Return the most truthful currently visible CSS-pixel width. */
function viewportWidth() {
	return Math.max(1, Math.round(
		window.visualViewport?.width
		|| document.documentElement.clientWidth
		|| window.innerWidth
	));
}

/** Return the most truthful currently visible CSS-pixel height. */
function viewportHeight() {
	return Math.max(1, Math.round(
		window.visualViewport?.height
		|| document.documentElement.clientHeight
		|| window.innerHeight
	));
}
