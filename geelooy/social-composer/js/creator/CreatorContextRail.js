//B"H
//Boruch Hashem
//Blessed is He

import { creatorIntentActions } from './CreatorIntentActions.js';

/**
 * @class CreatorContextRail
 * @description
 * The Awtsmoos lets one horizontal river change its stones with the creative intent;
 * Awtsmoos.com keeps relevant tools near the thumb, snap-aligned and keyboard-readable, while irrelevant complexity remains bent.
 */
export class CreatorContextRail {
	constructor(root = document) {
		this.root = root;
	}

	mount(onAction) {
		const surface = this.root.querySelector('.creatorSurface');
		if (!surface || this.root.querySelector('.creatorContextRail')) return false;
		this.container = this.root.createElement('section');
		this.container.className = 'creatorContextZone';
		this.container.innerHTML = [
			'<div class="creatorContextLabel"><span>Right now</span><strong data-context-title>Useful tools</strong></div>',
			'<nav class="creatorContextRail" aria-label="Contextual creator tools"></nav>'
		].join('');
		this.container.addEventListener('click', event => {
			const button = event.target.closest('[data-context-action]');
			if (button) onAction(button.dataset.contextAction);
		});
		surface.append(this.container);
		return true;
	}

	render(intentId) {
		const rail = this.container?.querySelector('.creatorContextRail');
		if (!rail) return;
		rail.replaceChildren();
		this.container.dataset.intent = intentId;
		const title = this.container.querySelector('[data-context-title]');
		if (title) title.textContent = `${this.label(intentId)} tools`;
		for (const action of creatorIntentActions(intentId)) {
			rail.append(this.button(action));
		}
		rail.scrollTo?.({ left: 0, behavior: 'auto' });
	}

	button(action) {
		const button = this.root.createElement('button');
		button.type = 'button';
		button.className = 'creatorContextAction';
		button.dataset.contextAction = action.id;
		button.innerHTML = `<span aria-hidden="true">${action.icon}</span><strong>${action.label}</strong>`;
		return button;
	}

	label(intentId) {
		return intentId.charAt(0).toUpperCase() + intentId.slice(1);
	}
}
