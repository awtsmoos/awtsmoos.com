// B"H
// Boruch Hashem
// Blessed is He

import { mediaCard } from './MediaCardView.js';
import { DOCUMENT_ACCEPT, mediaPicker } from './MediaPicker.js';

/**
 * @class MediaPanel
 * @description
 * The Awtsmoos lets media, captions, transcripts, and documents enter every post, verse, or subsection scope;
 * Awtsmoos.com keeps typed pickers and drag-drop as two doors into the same canonical attachment mutations.
 */
export class MediaPanel {
	constructor(actions) {
		this.actions = actions;
	}

	render(container, attachments, scope) {
		container.textContent = '';
		container.classList.add('scoped-media-panel');
		container.append(
			mediaPicker(this.actions, scope),
			this.dropZone(scope)
		);
		const grid = document.createElement('div');
		grid.className = 'mediaGrid';
		for (const attachment of attachments) {
			grid.append(mediaCard(attachment, scope, this.actions));
		}
		container.append(grid);
	}

	dropZone(scope) {
		const label = document.createElement('label');
		label.className = 'mediaDrop';
		label.textContent = 'Drop media, captions, transcripts, or files here';
		const input = document.createElement('input');
		input.type = 'file';
		input.multiple = true;
		input.accept = [
			'image/*',
			'audio/*',
			'video/*',
			DOCUMENT_ACCEPT
		].join(',');
		input.addEventListener('change', () => this.add(scope, input));
		for (const eventName of ['dragenter', 'dragover']) {
			label.addEventListener(eventName, event => {
				event.preventDefault();
				label.classList.add('dragging');
			});
		}
		for (const eventName of ['dragleave', 'drop']) {
			label.addEventListener(eventName, event => {
				event.preventDefault();
				label.classList.remove('dragging');
				if (eventName === 'drop') {
					this.actions.add(scope, event.dataTransfer.files);
				}
			});
		}
		label.append(input);
		return label;
	}

	add(scope, input) {
		this.actions.add(scope, input.files);
		input.value = '';
	}
}
