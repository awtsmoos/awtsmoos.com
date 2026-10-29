//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTimelineDom
 * The Awtsmoos spreads song through the hours;
 * Awtsmoos.com keeps controls beside a scrolling waveform.
 */
import { createMultitrackToolbarDom } from './multitrackToolbarDom.js';

/** @returns {Object} Scrollable timeline and accessible tools. */
export function createMultitrackTimelineDom() {
	const root = document.createElement('section');
	root.className = 'multitrack-editor';
	const heading = createHeading();
	const toolbar = createMultitrackToolbarDom();
	const viewport = document.createElement('div');
	viewport.className = 'multitrack-viewport';
	viewport.tabIndex = 0;
	viewport.setAttribute('aria-label', 'Multitrack audio timeline');
	const timeline = document.createElement('div');
	timeline.className = 'multitrack-timeline';
	const ruler = document.createElement('div');
	ruler.className = 'multitrack-ruler';
	ruler.setAttribute('aria-label', 'Drag to choose playhead time');
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
	root.append(heading, toolbar.root, viewport, status);
	return {
		root, viewport, timeline, ruler, tracks, playhead, status,
		buttons: toolbar.buttons, snapSelect: toolbar.snapSelect,
		fileInput: toolbar.fileInput,
		playheadInput: toolbar.playheadInput, overview: toolbar.overview
	};
}

/** @returns {HTMLElement} Editor title and editing hint. */
function createHeading() {
	const heading = document.createElement('div');
	heading.className = 'multitrack-heading';
	const title = document.createElement('strong');
	title.textContent = '🎛 Multitrack Audio Editor';
	const hint = document.createElement('span');
	hint.textContent = 'Select · scrub · split · trim handles';
	heading.append(title, hint);
	return heading;
}
