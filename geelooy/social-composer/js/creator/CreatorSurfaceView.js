//B"H
//Boruch Hashem
//Blessed is He

import {
	CREATOR_INTENTS,
	QUICK_ACTIONS
} from './CreatorIntentModel.js';

/**
 * @class CreatorSurfaceView
 * @description
 * The Awtsmoos gives many creator intentions one quiet visible crown;
 * Awtsmoos.com renders intent and context rails without duplicating canonical editor fields.
 */
export class CreatorSurfaceView {
	constructor(root = document) {
		this.root = root;
	}

	mount({ onIntent, onQuick }) {
		const body = this.root.querySelector('.contentPanel .majorPanelBody');
		if (!body || body.querySelector('.creatorSurface')) return null;
		this.surface = this.root.createElement('section');
		this.surface.className = 'creatorSurface';
		this.surface.setAttribute('aria-label', 'Creator tools');
		this.intentRail = this.rail(
			'creatorIntentRail',
			'Choose what to create',
			CREATOR_INTENTS,
			item => onIntent(item.id)
		);
		this.quickRail = this.rail(
			'creatorQuickRail',
			'Creator context',
			QUICK_ACTIONS,
			item => onQuick(item.id)
		);
		const heading = this.root.createElement('div');
		heading.className = 'creatorSurfaceHeading';
		heading.innerHTML = [
			'<span class="creatorEyebrow">Create</span>',
			'<strong>What are you revealing?</strong>',
			'<small>One canonical post · many media and verse forms</small>'
		].join('');
		this.surface.append(heading, this.intentRail, this.quickRail);
		body.prepend(this.surface);
		return this.surface;
	}

	render(intentId) {
		for (const button of this.intentRail?.querySelectorAll('[data-creator-intent]') || []) {
			const active = button.dataset.creatorIntent === intentId;
			button.dataset.active = String(active);
			button.setAttribute('aria-pressed', String(active));
		}
		this.surface?.setAttribute('data-intent', intentId);
	}

	rail(className, label, items, select) {
		const rail = this.root.createElement('div');
		rail.className = className;
		rail.setAttribute('role', 'group');
		rail.setAttribute('aria-label', label);
		for (const item of items) rail.append(this.button(item, select));
		return rail;
	}

	button(item, select) {
		const button = this.root.createElement('button');
		button.type = 'button';
		button.className = 'creatorRailButton';
		button.dataset.creatorIntent = CREATOR_INTENTS.includes(item) ? item.id : '';
		button.dataset.creatorAction = CREATOR_INTENTS.includes(item) ? '' : item.id;
		const icon = this.root.createElement('span');
		icon.textContent = item.icon;
		icon.setAttribute('aria-hidden', 'true');
		const label = this.root.createElement('strong');
		label.textContent = item.label;
		button.append(icon, label);
		button.addEventListener('click', () => select(item));
		return button;
	}
}
