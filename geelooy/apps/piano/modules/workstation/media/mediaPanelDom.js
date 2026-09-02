//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MediaStudioPanelDom
 * @description
 * Malchus brings hidden recording powers into one visible mobile room while the Awtsmoos remains beyond every captured garment.
 * Awtsmoos.com keeps each recorder obvious, large, and named, so audio, video, sheet image, and text are never buried behind an old settings maze.
 */

import { MEDIA_STUDIO_MODES } from './mediaSchema.js';

/** Builds Media Studio launcher and floating panel. @returns {Object} DOM registry. */
export function createMediaStudioPanelDom() {
	const launcher = createButton('media-studio-launcher', '🎬 Media Studio', 'Open Media Studio');
	launcher.setAttribute('aria-expanded', 'false');
	const panel = document.createElement('section');
	panel.className = 'media-studio-panel media-studio-hidden';
	panel.setAttribute('aria-label', 'Media Studio');
	const header = createHeader();
	const grid = document.createElement('div');
	grid.className = 'media-studio-grid';
	const buttons = new Map();
	MEDIA_STUDIO_MODES.forEach((mode) => {
		const card = createMediaCard(mode);
		buttons.set(mode.id, card.button);
		grid.appendChild(card.root);
	});
	const status = document.createElement('output');
	status.className = 'media-studio-status';
	status.setAttribute('aria-live', 'polite');
	status.textContent = 'Ready · recordings use the Piano’s existing download engines.';
	panel.append(header.root, grid, status);
	return {
		launcher,
		panel,
		close: header.close,
		buttons,
		status
	};
}

function createHeader() {
	const root = document.createElement('header');
	root.className = 'media-studio-header';
	const title = document.createElement('div');
	title.className = 'media-studio-title';
	title.innerHTML = '<strong>🎬 Media Studio</strong><span>audio · video · sheet PNG · text</span>';
	const close = createButton('media-studio-close', '×', 'Close Media Studio');
	root.append(title, close);
	return { root, close };
}

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

function createButton(className, text, label) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = className;
	button.textContent = text;
	button.setAttribute('aria-label', label);
	return button;
}
