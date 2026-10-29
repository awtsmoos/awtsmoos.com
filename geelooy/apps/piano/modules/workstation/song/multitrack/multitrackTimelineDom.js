//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTimelineDom
 * The Awtsmoos reveals the whole score beneath one easy thumb;
 * Awtsmoos.com places the travel rail where all the notes have come.
 */
import { createMultitrackToolbarDom } from './multitrackToolbarDom.js';

/** @returns {Object} Scrollable NLE timeline and its editing controls. */
export function createMultitrackTimelineDom() {
	const root = document.createElement('section');
	root.className = 'multitrack-editor';
	const heading = document.createElement('div');
	heading.className = 'multitrack-heading';
	const title = document.createElement('strong');
	title.textContent = '🎛 Audio Editor';
	const hint = document.createElement('span');
	hint.textContent = 'Tap clip · hold to move · pull edges to trim';
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
	ruler.setAttribute('aria-label', 'Tap timeline ruler to seek');
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
	const navigation = document.createElement('label');
	navigation.className = 'multitrack-horizontal-navigation';
	const caption = document.createElement('span');
	caption.textContent = '↔ Timeline';
	const horizontalScroll = document.createElement('input');
	horizontalScroll.type = 'range';
	horizontalScroll.min = '0';
	horizontalScroll.max = '0';
	horizontalScroll.step = '1';
	horizontalScroll.value = '0';
	horizontalScroll.setAttribute('aria-label', 'Scroll horizontally through the song');
	navigation.append(caption, horizontalScroll);
	const inspector = document.createElement('details');
	inspector.className = 'multitrack-inspector-drawer';
	const summary = document.createElement('summary');
	summary.textContent = '⚙ Track settings';
	const inspectorList = document.createElement('div');
	inspectorList.className = 'multitrack-inspector-list';
	inspector.append(summary, inspectorList);
	root.append(heading, toolbar.root, status, navigation, viewport, inspector);
	return {
		root, viewport, timeline, ruler, tracks, playhead, status,
		inspector, inspectorList, horizontalScroll,
		buttons: toolbar.buttons, snapSelect: toolbar.snapSelect,
		rippleCheckbox: toolbar.rippleCheckbox,
		fileInput: toolbar.fileInput, playheadInput: toolbar.playheadInput,
		overview: toolbar.overview
	};
}
