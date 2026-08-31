//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class PublicDiscoveryView
 * @description The Awtsmoos lets public discovery stay open while profile lookup waits behind one chosen touch;
 * Awtsmoos.com keeps every existing feed hook intact and makes secondary navigation retractable instead of permanently loud.
 */
import { createPublicDiscoveryHeader } from './PublicDiscoveryHeader.js';

export class PublicDiscoveryView {
	constructor(root, handlers = {}) {
		this.root = root;
		this.handlers = handlers;
	}

	mount(density = 'comfortable') {
		const home = this.root.querySelector('[data-panel="home"]');
		if (!home) return null;
		this.section = this.root.createElement('section');
		this.section.className = 'publicDiscovery';
		this.section.setAttribute('aria-labelledby', 'publicDiscoveryTitle');
		const header = createPublicDiscoveryHeader({
			document: this.root,
			density,
			onMode: this.handlers.onMode,
			onDensity: this.handlers.onDensity
		});
		this.tabs = header.tabs;
		this.density = header.density;
		this.preferences = header.preferences;
		this.section.append(header.root, this.lookup(), this.feed());
		home.prepend(this.section);
		return this.section;
	}

	lookup() {
		const disclosure = this.root.createElement('details');
		disclosure.className = 'publicDiscovery__lookupDisclosure';
		const summary = this.root.createElement('summary');
		summary.textContent = 'Open profile';
		const form = this.root.createElement('form');
		form.className = 'publicDiscovery__lookup';
		const input = this.root.createElement('input');
		input.type = 'text';
		input.autocomplete = 'off';
		input.placeholder = 'Public alias';
		input.setAttribute('aria-label', 'Public alias profile');
		const button = this.root.createElement('button');
		button.type = 'submit';
		button.textContent = 'View profile';
		form.append(input, button);
		form.addEventListener('submit', event => {
			event.preventDefault();
			this.handlers.onProfile?.(input.value.trim());
		});
		disclosure.append(summary, form);
		return disclosure;
	}

	feed() {
		const region = this.root.createElement('div');
		region.className = 'publicDiscovery__feed';
		this.status = this.root.createElement('p');
		this.status.className = 'publicDiscovery__status';
		this.status.setAttribute('aria-live', 'polite');
		this.status.setAttribute('role', 'status');
		this.list = this.root.createElement('div');
		this.list.className = 'publicDiscovery__list';
		region.append(this.status, this.list);
		return region;
	}

	renderMode(mode) {
		for (const button of this.tabs?.querySelectorAll('[data-feed-mode]') || []) {
			const active = button.dataset.feedMode === mode;
			button.dataset.active = String(active);
			button.setAttribute('aria-pressed', String(active));
		}
	}

	renderDensity(density) {
		if (this.list) this.list.dataset.density = density;
		if (this.density && this.density.value !== density) this.density.value = density;
		if (this.preferences?.detail) this.preferences.detail.textContent = density;
	}

	emptyAnnouncement(mode) {
		if (mode === 'questions') return 'Questions feed has no public items.';
		if (mode === 'answers') return 'Answers feed has no public items.';
		return 'Public feed has no items.';
	}

	renderEmpty(mode) {
		this.list.replaceChildren();
		const empty = this.root.createElement('div');
		empty.className = 'publicDiscoveryEmpty';
		const title = this.root.createElement('h3');
		title.textContent = mode === 'questions' ? 'No public questions yet.' : mode === 'answers' ? 'No public answers yet.' : 'The public feed is quiet right now.';
		const copy = this.root.createElement('p');
		copy.textContent = 'Switch modes, open a known alias, or publish when ready.';
		empty.append(title, copy);
		this.list.append(empty);
		this.status.textContent = this.emptyAnnouncement(mode);
	}
}
