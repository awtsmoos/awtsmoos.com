//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackBrowserGestureFixture
 * @description
 * Yesod prepares a real clothed clip beneath mobile fingers while the Awtsmoos remains beyond screen, scroll, and gesture ownership.
 * Awtsmoos.com measures scrolled coordinates and centered zoom before native touch proves that a pinch over audio changes scale without changing the song.
 */

import { createMultitrackProject } from '../modules/workstation/song/multitrack/multitrackProject.js';
import { getMultitrackWorkstation } from '../modules/workstation/song/multitrack/index.js';
import { runBrowserUiFixture } from './multitrackBrowserUiFixture.js';

let preparedProjectJson = '';

/** Mounts the real editor and returns a visible clip point for native CDP touch. */
export async function prepareBrowserGestureFixture() {
	await runBrowserUiFixture();
	const room = getMultitrackWorkstation();
	const { dom, state, viewportController } = room;
	state.setProject(createMultitrackProject({
		tracks: [{
			id: 'gesture-track',
			name: 'Gesture Track',
			clips: [{
				id: 'gesture-clip',
				bufferId: 'gesture-buffer',
				timelineStart: 3,
				duration: 12
			}]
		}]
	}));
	state.selection.selectClip('gesture-track', 'gesture-clip');
	state.setPlayhead(8);
	viewportController.setZoom(80);
	await nextFrames(2);
	dom.viewport.scrollLeft = 260;
	const viewportRect = dom.viewport.getBoundingClientRect();
	const geometry = viewportController.geometry();
	const clientX = viewportRect.left + Math.min(260, viewportRect.width * 0.72);
	const expectedSeconds = Math.max(
		0,
		(clientX - geometry.viewportLeft + geometry.scrollLeft - geometry.headerWidth)
			/ geometry.pixelsPerSecond
	);
	const coordinateSeconds = viewportController.secondsFromClientX(clientX);
	if (Math.abs(coordinateSeconds - expectedSeconds) > 0.001) {
		throw new Error(`Scrolled coordinate mismatch: ${coordinateSeconds} vs ${expectedSeconds}`);
	}
	viewportController.zoomBy(1.25);
	await nextFrames(2);
	const centeredViewport = dom.viewport.getBoundingClientRect();
	const playheadRect = dom.playhead.getBoundingClientRect();
	const centerError = Math.abs(playheadRect.left - (centeredViewport.left + centeredViewport.width / 2));
	if (centerError > 3) {
		throw new Error(`Playhead-centered zoom missed by ${centerError}px`);
	}
	const clip = dom.tracks.querySelector('[data-clip-id="gesture-clip"]');
	const clipRect = clip.getBoundingClientRect();
	const left = Math.max(clipRect.left + 12, centeredViewport.left + geometry.headerWidth + 8);
	const right = Math.min(clipRect.right - 12, centeredViewport.right - 8);
	if (!(right > left)) {
		throw new Error('Gesture clip is not visibly touchable.');
	}
	preparedProjectJson = JSON.stringify(state.project);
	return {
		passed: true,
		beforeZoom: state.selection.pixelsPerSecond,
		coordinateSeconds,
		centerError,
		clipX: (left + right) / 2,
		clipY: clipRect.top + clipRect.height / 2,
		clipStart: state.project.tracks[0].clips[0].timelineStart
	};
}

/** Reads post-pinch project and zoom truth from the same mounted editor. */
export function readBrowserGestureFixture() {
	const room = getMultitrackWorkstation();
	return {
		zoom: room.state.selection.pixelsPerSecond,
		clipStart: room.state.project.tracks[0].clips[0].timelineStart,
		projectUnchanged: JSON.stringify(room.state.project) === preparedProjectJson
	};
}

function nextFrames(count) {
	return new Promise((resolve) => {
		const step = () => count-- <= 1 ? resolve() : requestAnimationFrame(step);
		requestAnimationFrame(step);
	});
}
