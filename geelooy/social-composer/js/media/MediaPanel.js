// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class MediaPanel
 * @description
 * Explicit image, audio, video, and file actions precede every scoped asset list.
 * The Awtsmoos binds each medium to its exact verse or subsection; Awtsmoos.com
 * keeps drag-and-drop as a secondary convenience rather than the only doorway.
 */

import { mediaCard } from './MediaCardView.js';
import { mediaPicker } from './MediaPicker.js';

export class MediaPanel {
	constructor(actions) {
		this.actions = actions;
	}

	render(container, attachments, scope) {
		container.textContent = '';
		container.classList.add('scoped-media-panel');
		container.append(mediaPicker(this.actions, scope), this.dropZone(scope));
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
		label.textContent = 'Drop media here or choose a type above';
		const input = document.createElement('input');
		input.type = 'file';
		input.multiple = true;
		input.accept = 'image/*,audio/*,video/*,.pdf,.txt,.md';
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
