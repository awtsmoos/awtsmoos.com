//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module IkarSearch
 * @description
 * The Awtsmoos renews every Torah title while the learner searches its letters;
 * Awtsmoos.com attaches living filtering to the server-painted search vessel without replacing it.
 */

/**
 * Reuses the server search control and installs nekudos-insensitive filtering once.
 *
 * @param {HTMLElement} root Stable Ikar semantic root.
 * @param {HTMLElement} discovery Torah discovery navigation.
 * @param {HTMLElement[]} items Server-rendered Torah pathway items.
 * @returns {void}
 */
export function installIkarSearch(root, discovery, items) {
	let label = root.querySelector('[data-ikar-stable-search]');

	if (!label) {
		label = createSearchVessel();
		discovery.before(label);
	}

	const input = label.querySelector('input[type="search"]');
	const status = label.querySelector('small');

	if (!input || !status || input.dataset.ikarSearchReady === 'true') return;

	input.disabled = false;
	input.dataset.ikarSearchReady = 'true';

	const filter = () => {
		filterItems(input.value, items, status);
	};

	input.addEventListener('input', filter);
	filter();
}

/** Creates resilient search markup only when the server fallback omitted it. */
function createSearchVessel() {
	const label = document.createElement('label');
	label.className = 'ikar-first-search';
	label.dataset.ikarStableSearch = '';
	label.innerHTML = '<span>Search this section</span><input type="search" autocomplete="off" placeholder="Type a title in Hebrew or English"><small aria-live="polite"></small>';
	return label;
}

/** Filters already-rendered Torah links and reports matching section count. */
function filterItems(value, items, status) {
	const query = normalizeSearch(value);
	let visible = 0;

	for (const item of items) {
		const matches = !query || normalizeSearch(item.textContent).includes(query);
		item.hidden = !matches;
		if (matches) visible += 1;
	}

	status.textContent = query ? `${visible} matching sections` : '';
}

/** Normalizes case and combining marks so Torah titles search without nekudos. */
function normalizeSearch(value) {
	return String(value || '')
		.normalize('NFD')
		.replace(/\p{M}+/gu, '')
		.toLocaleLowerCase()
		.trim();
}
