//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class PublicDiscoveryView
 * @description
 * The Awtsmoos clothes public discovery in explicit DOM vessels: title, feed modes, profile doorway,
 * status, list, and honest quiet-state copy. Network and navigation remain outside this view.
 */

export class PublicDiscoveryView {
	constructor(root, handlers = {}) {
		this.root = root;
		this.handlers = handlers;
	}

	mount() {
		const home = this.root.querySelector('[data-panel="home"]');
		if (!home) return null;
		this.section = this.root.createElement('section');
		this.section.className = 'publicDiscovery';
		this.section.setAttribute('aria-labelledby', 'publicDiscoveryTitle');
		this.section.append(this.header(), this.lookup(), this.feed());
		home.prepend(this.section);
		return this.section;
	}

	header() {
		const header = this.root.createElement('header');
		header.className = 'publicDiscovery__header';
		const copy = this.root.createElement('div');
		const eyebrow = this.root.createElement('p');
		eyebrow.className = 'publicDiscovery__eyebrow';
		eyebrow.textContent = 'Public social';
		const title = this.root.createElement('h2');
		title.id = 'publicDiscoveryTitle';
		title.textContent = 'Discover living conversations';
		const description = this.root.createElement('p');
		description.textContent = 'Browse public posts or open any public alias profile. Log in only when you want to publish or manage your own identity.';
		copy.append(eyebrow, title, description);
		this.tabs = this.root.createElement('div');
		this.tabs.className = 'publicDiscovery__tabs';
		this.tabs.setAttribute('aria-label', 'Public feed mode');
		for (const [mode, label] of [['latest', 'Latest'], ['trending', 'Trending']]) {
			const button = this.root.createElement('button');
			button.type = 'button';
			button.textContent = label;
			button.dataset.feedMode = mode;
			button.addEventListener('click', () => this.handlers.onMode?.(mode));
			this.tabs.append(button);
		}
		header.append(copy, this.tabs);
		return header;
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

	renderEmpty(mode) {
		this.list.replaceChildren();
		const empty = this.root.createElement('div');
		empty.className = 'publicDiscoveryEmpty';
		const title = this.root.createElement('h3');
		title.textContent = 'The public feed is quiet right now.';
		const copy = this.root.createElement('p');
		copy.textContent = 'Nothing public is indexed in this view yet. Open a known alias above, or log in to publish from your own alias.';
		const login = this.root.createElement('a');
		login.href = '/login/?returnTo=/social-hub/';
		login.textContent = 'Log in to publish →';
		empty.append(title, copy, login);
		this.list.append(empty);
		this.status.textContent = mode === 'trending' ? 'No trending posts yet.' : 'No public posts yet.';
	}
}
