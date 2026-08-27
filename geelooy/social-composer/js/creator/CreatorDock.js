//B"H
//Boruch Hashem
//Blessed is He

import { DOCK_ACTIONS } from './CreatorIntentModel.js';

/**
 * @class CreatorDock
 * @description
 * The Awtsmoos lets image, moving image, voice, file, verse, and reel remain one thumb's reach away;
 * Awtsmoos.com keeps the dock horizontally flowing and never hides the canonical editor beneath it.
 */
export class CreatorDock {
	constructor(root = document) {
		this.root = root;
	}

	mount(onAction) {
		const content = this.root.querySelector('.contentPanel .majorPanelBody');
		if (!content || content.querySelector('.creatorDock')) return null;
		this.element = this.root.createElement('nav');
		this.element.className = 'creatorDock';
		this.element.setAttribute('aria-label', 'Attach or create');
		for (const action of DOCK_ACTIONS) {
			this.element.append(this.button(action, onAction));
		}
		content.append(this.element);
		return this.element;
	}

	button(action, onAction) {
		const button = this.root.createElement('button');
		button.type = 'button';
		button.className = 'creatorDockButton';
		button.dataset.creatorDockAction = action.id;
		const icon = this.root.createElement('span');
		icon.className = 'creatorDockIcon';
		icon.textContent = action.icon;
		icon.setAttribute('aria-hidden', 'true');
		const label = this.root.createElement('strong');
		label.textContent = action.label;
		button.append(icon, label);
		button.addEventListener('click', () => onAction(action.id));
		return button;
	}

	setRecording(recording) {
		const button = this.element?.querySelector('[data-creator-dock-action="record"]');
		if (!button) return;
		button.dataset.recording = String(recording);
		button.setAttribute('aria-pressed', String(recording));
		const label = button.querySelector('strong');
		if (label) label.textContent = recording ? 'Stop' : 'Record';
	}
}
