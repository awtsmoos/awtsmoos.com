//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTimelineDom
 * The Awtsmoos lets one great melody occupy the useful space;
 * Awtsmoos.com folds the mixing desk away from the playing place.
 */
import { createMultitrackToolbarDom } from './multitrackToolbarDom.js';

/** @returns {Object} A timeline with its mixer safely outside the scrolling lanes. */
export function createMultitrackTimelineDom() {
	const root = document.createElement('section');
	root.className = 'multitrack-editor';
	const heading = document.createElement('div');
	heading.className = 'multitrack-heading';
	const title = document.createElement('strong');
	title.textContent = '🎛 Audio Editor';
	const hint = document.createElement('span');
	hint.textContent = 'Tap to select · hold to move · pull edges to trim';
	heading.append(title, hint);
	const toolbar = createMultitrackToolbarDom();
	const viewport = document.createElement('div');
	viewport.className = 'multitrack-viewport';
	viewport.tabIndex = 0;
	viewport.setAttribute('aria-label', 'Scroll through audio tracks and time');
	const timeline = document.createElement('div');
	timeline.className = 'multitrack-timeline';
	const ruler = document.createElement('div');
	ruler.className = 'multitrack-ruler';
	ruler.setAttribute('aria-label', 'Drag ruler to position playhead');
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
	const inspector = document.createElement('details');
	inspector.className = 'multitrack-inspector-drawer';
	const summary = document.createElement('summary');
	summary.textContent = '⚙ Track settings';
	summary.setAttribute('aria-label', 'Expand track mixers and editing controls');
	const inspectorList = document.createElement('div');
	inspectorList.className = 'multitrack-inspector-list';
	inspector.append(summary, inspectorList);
	root.append(heading, toolbar.root, status, viewport, inspector);
	return {
		root, viewport, timeline, ruler, tracks, playhead, status,
		inspector, inspectorList,
		buttons: toolbar.buttons, snapSelect: toolbar.snapSelect,
		fileInput: toolbar.fileInput, playheadInput: toolbar.playheadInput,
		overview: toolbar.overview
	};
}
