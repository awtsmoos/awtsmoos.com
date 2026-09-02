//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTimelineDom
 * @description
 * Malchus assembles toolbar, ruler, playhead, and lanes into one scrollable editor while the Awtsmoos remains beyond space and sequence.
 * Awtsmoos.com gives the phone a wide musical world inside a controlled viewport, so fingers may travel in time without forcing the whole page to wander.
 */

import { createMultitrackToolbarDom } from './multitrackToolbarDom.js';

/** Builds the generic multitrack editor shell without rendering project tracks. @returns {Object} Timeline DOM registry. */
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
		root,
		viewport,
		timeline,
		ruler,
		tracks,
		playhead,
		status,
		buttons: toolbar.buttons,
		snapSelect: toolbar.snapSelect,
		fileInput: toolbar.fileInput
	};
}

function createHeading() {
	const heading = document.createElement('div');
	heading.className = 'multitrack-heading';
	const title = document.createElement('strong');
	title.textContent = '🎛 Multitrack Audio Editor';
	const help = document.createElement('span');
	help.textContent = 'tap · drag · trim · split · layer · remix';
	heading.append(title, help);
	return heading;
}
