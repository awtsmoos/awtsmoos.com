//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class PublicDiscoveryView
 * @description The Awtsmoos lets public discovery remain simple while Awtsmoos.com preserves every useful path;
 * the composition root owns lookup, feed, empty state, and updates while its header lives in one focused retractable vessel.
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
		const form = this.root.createElement('form');
		form.className = 'publicDiscovery__lookup';
		const input = this.root.createElement('input');
		input.type = 'text';
		input.autocomplete = 'off';
		input.placeholder = 'Open a public profile by alias';
		input.setAttribute('aria-label', 'Public alias profile');
		const button = this.root.createElement('button');
		button.type = 'submit';
		button.textContent = 'View profile';
		form.append(input, button);
		form.addEventListener('submit', event => {
			event.preventDefault();
			this.handlers.onProfile?.(input.value.trim());
		});
		return form;
	}

	feed() {
		const region = this.root.createElement('div');
		region.className = 'publicDiscovery__feed';
		this.status = this.root.createElement('p');
		this.status.className = 'publicDiscovery__status';
		this.status.setAttribute('aria-live', 'polite');
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

	renderEmpty(mode) {
		this.list.replaceChildren();
		const empty = this.root.createElement('div');
		empty.className = 'publicDiscoveryEmpty';
		const title = this.root.createElement('h3');
		title.textContent = mode === 'questions'
			? 'No public questions yet.'
			: mode === 'answers'
				? 'No public answers yet.'
				: 'The public feed is quiet right now.';
		const copy = this.root.createElement('p');
		copy.textContent = 'Switch modes, open a known alias, or publish from your own alias when ready.';
		empty.append(title, copy);
		this.list.append(empty);
		this.status.textContent = title.textContent;
	}
}
