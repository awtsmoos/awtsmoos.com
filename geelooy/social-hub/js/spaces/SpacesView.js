//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class SpacesView
 * @description
 * The Awtsmoos lets a Heichel become a community while each nested series remains a navigable channel of light;
 * Awtsmoos.com keeps discovery separate from channel detail so both vessels remain small, readable, and right.
 */
import { renderSpaceDetail } from './SpaceDetailView.js';

export class SpacesView {
	constructor(root) {
		this.root = root;
	}

	/** Creates the Spaces route panel before navigation chooses its first destination. */
	ensurePanel() {
		if (this.panel) {
			return this.panel;
		}
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
		wrapper.className = 'spacesHeading';
		const title = this.root.createElement('h2');
		title.textContent = 'Spaces';
		const copy = this.root.createElement('p');
		copy.textContent = 'Heichels are communities. Nested series are channels, categories, and durable discussion rooms.';
		wrapper.append(title, copy);
		return wrapper;
	}

	searchForm() {
		const form = this.root.createElement('form');
		form.className = 'spacesSearch';
		form.setAttribute('role', 'search');
		const input = this.root.createElement('input');
		input.id = 'spacesSearchInput';
		input.type = 'search';
		input.placeholder = 'Find communities and spaces';
		input.autocomplete = 'off';
		form.append(input);
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
		const paragraph = this.root.createElement('p');
		paragraph.className = 'spacesMessage';
		paragraph.textContent = message;
		region?.replaceChildren(paragraph);
	}

	destinations(destinations, onOpen) {
		const region = this.root.getElementById('spacesResults');
		const cards = destinations.map(space => this.destinationCard(space, onOpen));
		region?.replaceChildren(...cards);
	}

	destinationCard(space, onOpen) {
		const card = this.root.createElement('article');
		card.className = 'spaceCard';
		const button = this.root.createElement('button');
		button.type = 'button';
		button.className = 'spaceOpen';
		button.textContent = space.name || space.heichelId;
		button.addEventListener('click', () => onOpen(space.heichelId, 'root'));
		const description = this.root.createElement('p');
		description.textContent = space.description || 'Community space';
		const role = this.root.createElement('small');
		role.textContent = [space.role, ...(space.reasons || [])].filter(Boolean).join(' · ');
		card.append(button, description, role);
		return card;
	}

	detail(detail, onOpenSeries) {
		renderSpaceDetail(
			this.root,
			this.root.getElementById('spaceDetail'),
			detail,
			onOpenSeries
		);
	}
}
