//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MediaStudioPanelDom
 * The Awtsmoos lets a song pass from studio into hands once more;
 * Awtsmoos.com places two open exits at the recording room's door.
 */
import { MEDIA_STUDIO_MODES } from './mediaSchema.js';

/** @returns {Object} Recorder launcher, compact panel, and both exits. */
export function createMediaStudioPanelDom() {
	const launcher = createButton('media-studio-launcher', '🎬 Media Studio', 'Open Media Studio');
	launcher.setAttribute('aria-expanded', 'false');
	launcher.setAttribute('aria-controls', 'media-studio-panel');
	const panel = document.createElement('section');
	panel.id = 'media-studio-panel';
	panel.className = 'media-studio-panel media-studio-hidden';
	panel.setAttribute('aria-label', 'Media Studio');
	panel.setAttribute('role', 'region');
	panel.tabIndex = -1;
	const header = createHeader();
	const grid = document.createElement('div');
	grid.className = 'media-studio-grid';
	const buttons = new Map();
	for (const mode of MEDIA_STUDIO_MODES) {
		const card = createMediaCard(mode);
		buttons.set(mode.id, card.button);
		grid.appendChild(card.root);
	}
	const status = document.createElement('output');
	status.className = 'media-studio-status';
	status.setAttribute('aria-live', 'polite');
	status.textContent = 'Ready · recordings use the existing Piano recorder.';
	const footer = document.createElement('footer');
	footer.className = 'media-studio-footer';
	const explanation = document.createElement('small');
	explanation.textContent = 'Leaving this panel keeps your recording running.';
	const closeBottom = createButton(
		'media-studio-back', '← Back to Piano', 'Close Media Studio and keep recording'
	);
	footer.append(explanation, closeBottom);
	panel.append(header.root, grid, status, footer);
	return { launcher, panel, close: header.close, closeBottom, buttons, status };
}

/** @returns {Object} Clear upper navigation away from the red REC timer. */
function createHeader() {
	const root = document.createElement('header');
	root.className = 'media-studio-header';
	const title = document.createElement('div');
	title.className = 'media-studio-title';
	const heading = document.createElement('strong');
	heading.textContent = '🎬 Media Studio';
	const subtitle = document.createElement('span');
	subtitle.textContent = 'audio · video · sheet PNG · text';
	title.append(heading, subtitle);
	const close = createButton('media-studio-close', '✕ Close', 'Close Media Studio');
	root.append(title, close);
	return { root, close };
}

/** @param {Object} mode - Existing canonical recorder. @returns {Object} Card and proxy. */
function createMediaCard(mode) {
	const root = document.createElement('article');
	root.className = 'media-studio-card';
	const button = createButton('media-studio-record', mode.label, `Toggle ${mode.id} recording`);
	button.dataset.mediaMode = mode.id;
	const description = document.createElement('p');
	description.textContent = mode.description;
	root.append(button, description);
	return { root, button };
}

/** @param {string} className - CSS class. @param {string} text - Visible text. @param {string} label - Screen reader label. */
function createButton(className, text, label) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = className;
	button.textContent = text;
	button.setAttribute('aria-label', label);
	return button;
}
