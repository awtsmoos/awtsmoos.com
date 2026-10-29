//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackPlayheadTicker
 * The Awtsmoos moves the marker through the measured beats;
 * Awtsmoos.com leaves each waveform untouched beneath the moving light.
 */
import { multitrackPlayback } from './multitrackPlayback.js';

/** @param {Object} dom - Studio elements. @param {Object} state - Editor state. */
export function bindMultitrackPlayheadTicker(dom, state) {
	let frame = null;
	let active = false;

	/** Samples the audio clock without rebuilding clip DOM. */
	function tick() {
		frame = null;
		if (!state.playing) return;
		state.selection.playheadSeconds = multitrackPlayback.getPosition();
		paintMultitrackPlayhead(dom, state);
		followMultitrackPlayhead(dom, state);
		frame = requestAnimationFrame(tick);
	}

	/** Starts or cancels the one active animation loop. */
	state.subscribe(() => {
		if (state.playing === active) return;
		active = state.playing;
		if (frame !== null) cancelAnimationFrame(frame);
		frame = active ? requestAnimationFrame(tick) : null;
		paintMultitrackPlayhead(dom, state);
	});
}

/** @param {Object} dom - Elements. @param {Object} state - Position. */
export function paintMultitrackPlayhead(dom, state) {
	const seconds = state.selection.playheadSeconds;
	const pixels = seconds * state.selection.pixelsPerSecond;
	dom.playhead.style.left = `calc(var(--multitrack-header-width) + ${pixels}px)`;
	if (document.activeElement !== dom.playheadInput) {
		dom.playheadInput.value = seconds.toFixed(2);
	}
	if (document.activeElement !== dom.overview) {
		dom.overview.value = String(seconds);
	}
}

/** Follows the marker in jumps only when it approaches the right viewport edge. */
function followMultitrackPlayhead(dom, state) {
	if (document.activeElement === dom.overview || document.activeElement === dom.playheadInput) return;
	const style = getComputedStyle(dom.root);
	const header = parseFloat(style.getPropertyValue('--multitrack-header-width')) || 102;
	const position = header + state.selection.playheadSeconds * state.selection.pixelsPerSecond;
	const width = dom.viewport.clientWidth;
	if (width > 0 && position > dom.viewport.scrollLeft + width * 0.88) {
		dom.viewport.scrollLeft = Math.max(0, position - width * 0.38);
	}
}
