//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackViewportController
 * @description
 * Tiferes balances scroll, scale, and playhead around one visible center while the Awtsmoos remains beyond measure and screen.
 * Awtsmoos.com lets Zoom, Fit, seek, and audible follow share one coordinate vessel, so the scrollbar never wanders far from the red thread of time.
 */

import { multitrackProjectDuration } from './multitrackProject.js';
import {
	centeredMultitrackScroll,
	clampZoom,
	fitMultitrackZoom,
	timelineClientXToSeconds,
	timelineSecondsToContentPixels
} from './multitrackTimelineMath.js';

const FOLLOW_MARGIN_PIXELS = 54;

/** Creates DOM-aware viewport operations backed by pure timeline math. */
export function createMultitrackViewportController(dom, state) {
	function geometry() {
		return {
			viewportLeft: dom.viewport.getBoundingClientRect().left,
			scrollLeft: dom.viewport.scrollLeft,
			headerWidth: readHeaderWidth(dom),
			pixelsPerSecond: state.selection.pixelsPerSecond
		};
	}

	function centerPlayhead() {
		dom.viewport.scrollLeft = centeredMultitrackScroll({
			playheadSeconds: state.selection.playheadSeconds,
			pixelsPerSecond: state.selection.pixelsPerSecond,
			headerWidth: readHeaderWidth(dom),
			viewportWidth: dom.viewport.clientWidth,
			scrollWidth: dom.viewport.scrollWidth
		});
	}

	function ensurePlayheadVisible() {
		const playheadX = timelineSecondsToContentPixels(
			state.selection.playheadSeconds,
			geometry()
		);
		const left = dom.viewport.scrollLeft + readHeaderWidth(dom) + FOLLOW_MARGIN_PIXELS;
		const right = dom.viewport.scrollLeft + dom.viewport.clientWidth - FOLLOW_MARGIN_PIXELS;
		if (playheadX < left || playheadX > right) {
			centerPlayhead();
		}
	}

	function setZoom(value) {
		state.setZoom(clampZoom(value));
		requestAnimationFrame(centerPlayhead);
	}

	return {
		geometry,
		centerPlayhead,
		ensurePlayheadVisible,
		setZoom,
		zoomBy: (factor) => setZoom(state.selection.pixelsPerSecond * factor),
		fit() {
			const duration = Math.max(0.001, multitrackProjectDuration(state.project));
			setZoom(fitMultitrackZoom(duration, dom.viewport.clientWidth, readHeaderWidth(dom)));
		},
		secondsFromClientX(clientX) {
			return timelineClientXToSeconds(clientX, geometry());
		}
	};
}

function readHeaderWidth(dom) {
	const trackHeader = dom.tracks.querySelector('.multitrack-track-header');
	if (trackHeader?.offsetWidth) {
		return trackHeader.offsetWidth;
	}
	const value = getComputedStyle(dom.root).getPropertyValue('--multitrack-header-width');
	return Number.parseFloat(value) || 132;
}
