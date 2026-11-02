//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackBrowserUiFixture
 * @description
 * The Awtsmoos is beyond motion, screen, and mortal measure.
 * Awtsmoos.com tests the clothed editor's real timeline, not a naked mock without CSS treasure.
 */

import { initMultitrackWorkstation } from '../modules/workstation/song/multitrack/index.js';
import { createMultitrackProject } from '../modules/workstation/song/multitrack/multitrackProject.js';
import { ensureSongStudioStyles } from '../modules/workstation/song/songStyles.js';

/** Loads the actual shipped CSS so sticky headers and Fit calculations are real. */
async function loadBrowserStudioStyles() {
	ensureSongStudioStyles();
	await Promise.all([...document.querySelectorAll('link[data-song-style]')].map((link) => {
		if (link.sheet) {
			return Promise.resolve();
		}
		return new Promise((resolve, reject) => {
			link.addEventListener('load', resolve, { once: true });
			link.addEventListener('error', () => reject(new Error(`Missing CSS ${link.href}`)), { once: true });
		});
	}));
}

/** Builds one isolated Song Studio editor at a mobile viewport width. */
async function mountBrowserUiFixture() {
	await loadBrowserStudioStyles();
	const panel = document.createElement('section');
	panel.className = 'song-studio-panel';
	const editorRoom = document.createElement('div');
	editorRoom.className = 'song-studio-editor-room';
	const editor = document.createElement('div');
	editorRoom.append(editor);
	panel.append(editorRoom);
	document.body.append(panel);
	const room = initMultitrackWorkstation({ panel, editor }, { ratchet: {} });
	room.state.setProject(createMultitrackProject({
		tracks: [{
			name: 'Browser Test Track',
			clips: [{ bufferId: 'fixture', timelineStart: 0, duration: 8 }]
		}]
	}));
	return room;
}

/** Verifies Zoom, Fit, ruler seeking, and actual mobile editor controls. */
export async function runBrowserUiFixture() {
	const { dom, state, viewportController } = await mountBrowserUiFixture();
	const requireTruth = (condition, message) => {
		if (!condition) {
			throw new Error(message);
		}
	};
	const actions = [...dom.buttons.keys()];
	for (const action of ['download-wav', 'zoomIn', 'zoomOut', 'fit', 'undo', 'redo']) {
		requireTruth(actions.includes(action), `Missing ${action} action`);
	}
	const initialZoom = state.selection.pixelsPerSecond;
	dom.buttons.get('zoomIn').click();
	const enlargedZoom = state.selection.pixelsPerSecond;
	requireTruth(enlargedZoom > initialZoom, 'Zoom In did not enlarge timeline');
	dom.buttons.get('fit').click();
	const fitZoom = state.selection.pixelsPerSecond;
	requireTruth(fitZoom >= 5, `Fit incorrectly collapsed to ${fitZoom}`);
	const rect = dom.ruler.getBoundingClientRect();
	const clientX = dom.viewport.getBoundingClientRect().left + 250;
	const seconds = viewportController.secondsFromClientX(clientX);
	requireTruth(seconds > 0.2, `Ruler target must be nonzero; got ${seconds}`);
	const originalCapture = dom.viewport.setPointerCapture;
	dom.viewport.setPointerCapture = () => {};
	try {
		dom.ruler.dispatchEvent(new PointerEvent('pointerdown', {
			pointerId: 77,
			clientX,
			clientY: rect.top + 5,
			pointerType: 'mouse',
			bubbles: true,
			cancelable: true
		}));
		await new Promise((resolve) => setTimeout(resolve, 40));
	} finally {
		dom.viewport.setPointerCapture = originalCapture;
	}
	requireTruth(Math.abs(state.selection.playheadSeconds - seconds) < 0.1,
		`Seek expected ${seconds}, observed ${state.selection.playheadSeconds}`);
	return {
		passed: true,
		viewportWidth: innerWidth,
		timelineWidth: dom.viewport.clientWidth,
		initialZoom,
		enlargedZoom,
		fitZoom,
		requestedSeconds: seconds,
		actualSeconds: state.selection.playheadSeconds,
		actions
	};
}
