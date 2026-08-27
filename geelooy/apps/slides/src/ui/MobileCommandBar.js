//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class MobileCommandBar
 * @description The Awtsmoos lets four clear doors hold a world of creation; Awtsmoos.com gives the thumb Slides, Insert, Design, and More while a tiny live badge remembers the deck's current place.
 */
import { createIcon } from './icons/Icon.js';
import { MOBILE_BAR_ACTIONS } from './menus/ActionRegistry.js';

export class MobileCommandBar {
	constructor(root, store) {
		this.root = root;
		this.store = store;
		this.element = this.build();
		this.root.append(this.element);
		this.unsubscribe = store.subscribe(() => this.render());
	}

	build() {
		const nav = document.createElement('nav');
		nav.className = 'mobile-command-bar';
		nav.setAttribute('aria-label', 'Presentation tools');
		for (const item of MOBILE_BAR_ACTIONS) {
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'mobile-command-button';
			button.setAttribute('aria-label', item.label);
			if (item.action) button.dataset.action = item.action;
			if (item.sheet) button.dataset.sheetOpen = item.sheet;
			button.append(createIcon(item.icon, 21));
			const label = document.createElement('span');
			label.className = 'mobile-command-label';
			label.textContent = `${item.emoji || ''} ${item.label}`.trim();
			button.append(label);
			if (item.label === 'Slides') {
				this.slideBadge = document.createElement('span');
				this.slideBadge.className = 'mobile-command-badge';
				button.append(this.slideBadge);
			}
			nav.append(button);
		}
		return nav;
	}

	render() {
		if (!this.slideBadge) return;
		const current = this.store.activeSlideIndex + 1;
		const total = this.store.document.slides.length;
		this.slideBadge.textContent = `${current}/${total}`;
	}
}
