//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTimelineDom
 * The Awtsmoos reveals the cut at the moment and place of choice;
 * Awtsmoos.com shows the result beside the waveform, in a readable voice.
 */
import { createMultitrackToolbarDom } from './multitrackToolbarDom.js';

/** @returns {Object} Touch-friendly audio editor with nearby cut feedback. */
export function createMultitrackTimelineDom() {
	const root = document.createElement('section');
	root.className = 'multitrack-editor';
	const heading = createHeading();
	const toolbar = createMultitrackToolbarDom();
	const viewport = document.createElement('div');
	viewport.className = 'multitrack-viewport';
	viewport.tabIndex = 0;
	viewport.setAttribute('aria-label', 'Scrollable multitrack audio timeline');
	const timeline = document.createElement('div');
	timeline.className = 'multitrack-timeline';
	const ruler = document.createElement('div');
	ruler.className = 'multitrack-ruler';
	ruler.setAttribute('aria-label', 'Drag to place the cut marker');
	const tracks = document.createElement('div');
	tracks.className = 'multitrack-tracks';
	const playhead = document.createElement('div');
	playhead.className = 'multitrack-playhead';
	playhead.setAttribute('aria-hidden', 'true');
	timeline.append(ruler, tracks, playhead);
	viewport.appendChild(timeline);
	const status = document.createElement('output');
	status.className = 'multitrack-status';
	status.setAttribute('aria-live', 'polite');
	root.append(heading, toolbar.root, status, viewport);
	return {
		root, viewport, timeline, ruler, tracks, playhead, status,
		buttons: toolbar.buttons, snapSelect: toolbar.snapSelect,
		fileInput: toolbar.fileInput, playheadInput: toolbar.playheadInput,
		overview: toolbar.overview
	};
}

/** @returns {HTMLElement} Compact editor title with a single useful gesture hint. */
function createHeading() {
	const heading = document.createElement('div');
	heading.className = 'multitrack-heading';
	const title = document.createElement('strong');
	title.textContent = '🎛 Audio Editor';
	const hint = document.createElement('span');
	hint.textContent = 'Tap sound to set cut · hold to move · drag edges to trim';
	heading.append(title,hint);
	return heading;
}
