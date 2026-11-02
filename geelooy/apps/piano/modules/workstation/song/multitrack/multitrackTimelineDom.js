//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTimelineDom
 * @description
 * Malchus assembles compact controls, live time, ruler, playhead, and lanes while the Awtsmoos remains beyond space and sequence.
 * Awtsmoos.com gives the phone a broad musical world inside one scrollable vessel, so waveform territory grows while secondary controls fold away in peace.
 */

import { createMultitrackToolbarDom } from './multitrackToolbarDom.js';

/** Builds the generic multitrack editor shell without rendering project tracks. */
export function createMultitrackTimelineDom() {
	const root = document.createElement('section');
	root.className = 'multitrack-editor';
	const heading = createHeading();
	const toolbar = createMultitrackToolbarDom();
	const timeDisplay = document.createElement('output');
	timeDisplay.className = 'multitrack-time-display';
	timeDisplay.setAttribute('aria-label', 'Current playhead time');
	timeDisplay.textContent = '0:00.00';
	const viewport = document.createElement('div');
	viewport.className = 'multitrack-viewport';
	viewport.tabIndex = 0;
	viewport.setAttribute('aria-label', 'Multitrack audio timeline');
	const timeline = document.createElement('div');
	timeline.className = 'multitrack-timeline';
	const ruler = document.createElement('div');
	ruler.className = 'multitrack-ruler';
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
	root.append(heading, toolbar.root, timeDisplay, viewport, status);
	return {
		root,
		viewport,
		timeline,
		ruler,
		tracks,
		playhead,
		timeDisplay,
		status,
		buttons: toolbar.buttons,
		snapSelect: toolbar.snapSelect,
		rippleInput: toolbar.rippleInput,
		magnetInput: toolbar.magnetInput,
		fileInput: toolbar.fileInput
	};
}

function createHeading() {
	const heading = document.createElement('div');
	heading.className = 'multitrack-heading';
	const title = document.createElement('strong');
	title.textContent = '🎛 Song Studio';
	const help = document.createElement('span');
	help.textContent = 'tap ruler to seek · pinch timeline to zoom';
	heading.append(title, help);
	return heading;
}
