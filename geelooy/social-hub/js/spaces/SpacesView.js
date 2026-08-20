//B"H
//Boruch Hashem
//Blessed is He

import { hubIcon } from '../ui/IconCatalog.js';
import { createSmartTextField } from '../ui/fields/SmartTextField.js';
import { renderSpaceDetail } from './SpaceDetailView.js';

/**
 * @class SpacesView
 * @description
 * The Awtsmoos lets communities appear as living destinations before explanation, while Awtsmoos.com replaces a bare search line with an icon-led discovery vessel and scannable community cards;
 * Heichel and series semantics remain exact beneath the surface, yet the user meets name, signal, and action before implementation vocabulary enters the light.
 */
export class SpacesView {
	constructor(root) {
		this.root = root;
	}

	ensurePanel() {
		if (this.panel) return this.panel;
		this.panel = this.root.createElement('section');
		this.panel.className = 'panel spacesPanel';
		this.panel.dataset.panel = 'spaces';
		this.panel.hidden = true;
		this.panel.tabIndex = -1;
		this.panel.append(
			this.heading(),
			this.searchForm(),
			this.region('spacesResults', 'Community results'),
			this.region('spaceDetail', 'Selected community')
		);
		this.root.querySelector('.workspace')?.prepend(this.panel);
		return this.panel;
	}

	heading() {
		const wrapper = this.root.createElement('header');
		wrapper.className = 'spacesHeading hubSectionHeading--icon';
		wrapper.append(this.text('span', hubIcon('spaces'), 'hubSectionHeading__icon'));
		wrapper.append(this.text('h2', 'Spaces'));
		return wrapper;
	}

	searchForm() {
		const form = this.root.createElement('form');
		form.className = 'spacesSearch spacesSearch--smart';
		form.setAttribute('role', 'search');
		const field = createSmartTextField(this.root, {
			id: 'spacesSearchInput',
			kind: 'search',
			label: 'Find communities and spaces',
			placeholder: 'Find a space…',
			icon: hubIcon('search'),
			maxLength: 100
		});
		form.append(field.element);
		return form;
	}

	region(id, label) {
		const region = this.root.createElement('div');
		region.id = id;
		region.className = 'spacesRegion';
		region.setAttribute('aria-label', label);
		region.setAttribute('aria-live', 'polite');
		return region;
	}

	message(regionId, message) {
		const region = this.root.getElementById(regionId);
		const state = this.root.createElement('div');
		state.className = 'hubCompactState';
		state.append(this.text('span', hubIcon('spaces'), 'hubCompactState__icon'));
		state.append(this.text('span', message, 'hubCompactState__text'));
		region?.replaceChildren(state);
	}

	destinations(destinations, onOpen) {
		const region = this.root.getElementById('spacesResults');
		region?.replaceChildren(...destinations.map(space => this.destinationCard(space, onOpen)));
	}

	destinationCard(space, onOpen) {
		const card = this.root.createElement('article');
		card.className = 'spaceCard spaceCard--compact';
		const emblem = this.text('span', '◫', 'spaceCard__emblem');
		const copy = this.root.createElement('div');
		copy.className = 'spaceCard__copy';
		copy.append(this.text('strong', space.name || space.heichelId));
		if (space.description) copy.append(this.text('p', space.description));
		const button = this.root.createElement('button');
		button.type = 'button';
		button.className = 'spaceOpen spaceOpen--icon';
		button.setAttribute('aria-label', `Open ${space.name || space.heichelId}`);
		button.title = `Open ${space.name || space.heichelId}`;
		button.textContent = '→';
		button.addEventListener('click', () => onOpen(space.heichelId, 'root'));
		card.append(emblem, copy, button);
		return card;
	}

	detail(detail, onOpenSeries) {
		renderSpaceDetail(this.root, this.root.getElementById('spaceDetail'), detail, onOpenSeries);
	}

	text(tag, value, className = '') {
		const node = this.root.createElement(tag);
		node.textContent = value;
		if (className) node.className = className;
		return node;
	}
}
