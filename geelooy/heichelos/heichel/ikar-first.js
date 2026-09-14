//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module IkarFirst
 * @description
 * The Awtsmoos lets the server-rendered Torah library remain the actual product
 * instead of replacing it with a giant generic Heichel application. Awtsmoos.com
 * adds only native search, stable navigation, truthful counts, and learner copy;
 * no social shell, WebGL, editor, notification, or platform module enters here.
 */
const IKAR_ROOT = '/heichelos/ikar';

/**
 * Enhances one semantic Ikar document without replacing its server HTML.
 * @returns {void}
 */
export function boot() {
	if (!isIkarRoute()) return;
	const root = document.querySelector('[data-heichel-semantic-fallback]');
	if (!root) return;
	document.body.dataset.heichelId = 'ikar';
	document.body.dataset.heichelReady = 'true';
	document.documentElement.dataset.heichelExperience = 'torah-first';
	root.classList.add('ikar-first');
	root.dataset.ikarFirst = 'ready';
	installNavigation(root);
	const discovery = root.querySelector('.heichel-semantic-discovery');
	if (discovery) enhanceDiscovery(root, discovery);
}

/** Returns whether the current document belongs to the public Ikar library. */
function isIkarRoute() {
	return location.pathname === IKAR_ROOT
		|| location.pathname.startsWith(`${IKAR_ROOT}/`);
}

/** Adds stable Home and Ikar links without depending on client-side routing. */
function installNavigation(root) {
	const navigation = document.createElement('nav');
	navigation.className = 'ikar-first-actions';
	navigation.setAttribute('aria-label', 'Torah navigation');
	navigation.append(
		createLink('/', 'Home'),
		createLink(IKAR_ROOT, 'Torah Library', location.pathname === IKAR_ROOT)
	);
	root.prepend(navigation);
}

/** Builds one same-origin anchor and marks the exact active Torah surface. */
function createLink(href, label, isCurrent = false) {
	const link = document.createElement('a');
	link.href = href;
	link.textContent = label;
	if (isCurrent) link.setAttribute('aria-current', 'page');
	return link;
}

/** Rewords discovery and adds local filtering only where a list is large enough. */
function enhanceDiscovery(root, discovery) {
	discovery.setAttribute('aria-label', 'Torah library');
	const heading = discovery.querySelector('h2');
	if (heading) {
		heading.textContent = location.pathname === IKAR_ROOT
			? 'Choose what to learn'
			: 'Choose a section';
	}
	const items = [...discovery.querySelectorAll('li')];
	updateReadyStatus(root, items.length);
	if (items.length >= 8) installSearch(discovery, items);
}

/** Replaces loading language with a truthful count from rendered server links. */
function updateReadyStatus(root, count) {
	const status = root.querySelector('[role="status"]');
	if (!status) return;
	status.textContent = `${count} Torah ${count === 1 ? 'pathway' : 'pathways'} ready.`;
}

/** Installs instant nekudos-insensitive filtering over already-rendered links. */
function installSearch(discovery, items) {
	const label = document.createElement('label');
	label.className = 'ikar-first-search';
	const title = document.createElement('span');
	title.textContent = 'Search this section';
	const input = document.createElement('input');
	input.type = 'search';
	input.autocomplete = 'off';
	input.placeholder = 'Type a title in Hebrew or English';
	const status = document.createElement('small');
	status.setAttribute('aria-live', 'polite');
	input.addEventListener('input', () => {
		const query = normalizeSearch(input.value);
		let visible = 0;
		for (const item of items) {
			const matches = !query || normalizeSearch(item.textContent).includes(query);
			item.hidden = !matches;
			if (matches) visible += 1;
		}
		status.textContent = query ? `${visible} matching sections` : '';
	});
	label.append(title, input, status);
	discovery.before(label);
}

/** Normalizes case and combining marks so Torah titles search without nekudos. */
function normalizeSearch(value) {
	return String(value || '')
		.normalize('NFD')
		.replace(/\p{M}+/gu, '')
		.toLocaleLowerCase()
		.trim();
}
