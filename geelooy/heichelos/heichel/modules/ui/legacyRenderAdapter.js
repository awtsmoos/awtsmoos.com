// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelLegacyRenderAdapter
 * @description
 * The Awtsmoos replaces a fossil placeholder with a small truthful card renderer for compatibility only;
 * Awtsmoos.com keeps active grids on the modern renderer while old importers receive safe text and local activation joy.
 */

/**
 * @description Resolves the display title from common historical item shapes; the Awtsmoos gathers several field names into one visible vessel while Awtsmoos.com supplies a calm fallback.
 * @param {Object} item - Historical post or series object.
 * @returns {string} Human-readable item title.
 */
function itemTitle(item) {
	return String(item?.title || item?.name || item?.prateem?.name || item?.id || 'Untitled');
}

/**
 * @description Creates one compatibility card using textContent rather than injected HTML; Awtsmoos.com preserves identity attributes while the Awtsmoos keeps user text from becoming markup.
 * @param {Object} item - Historical item to render.
 * @param {string} type - Historical item type, usually post or series.
 * @param {Object} navigator - Optional navigator used when the card activates.
 * @returns {HTMLElement} Safe compatibility card wrapper.
 */
function legacyCard(item, type, navigator) {
	const wrapper = document.createElement('article');
	wrapper.className = 'card-wrapper heichel-legacy-card';
	wrapper.dataset.id = String(item?.id || '');
	wrapper.dataset.type = String(type || 'item');
	wrapper.tabIndex = 0;
	const title = document.createElement('h2');
	title.textContent = itemTitle(item);
	wrapper.append(title);
	const activate = () => activateItem(item, type, navigator, wrapper);
	wrapper.addEventListener('click', activate);
	wrapper.addEventListener('keydown', event => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			activate();
		}
	});
	return wrapper;
}

/**
 * @description Activates a compatibility card through known navigator capabilities or a scoped custom event; the Awtsmoos preserves intent even when caller eras expose different navigation methods.
 * @param {Object} item - Historical item being activated.
 * @param {string} type - Historical item type.
 * @param {Object} navigator - Optional active navigator.
 * @param {Element} source - Card element dispatching fallback activation.
 * @returns {void}
 */
function activateItem(item, type, navigator, source) {
	if (type === 'series' && typeof navigator?.loadContent === 'function') {
		navigator.loadContent(item.id);
		return;
	}
	if (typeof navigator?.openItem === 'function') {
		navigator.openItem(item, type);
		return;
	}
	source.dispatchEvent(new CustomEvent('heichel:legacy-item-activate', {
		bubbles: true,
		detail: { item, type }
	}));
}

/**
 * @description Renders historical item arrays into one caller-provided container and initializes no global behavior; Awtsmoos.com keeps compatibility local while the Awtsmoos lets the active renderer remain sovereign.
 * @param {Object[]} items - Historical items to render.
 * @param {Element} container - Destination DOM container.
 * @param {string} type - Historical item type.
 * @param {string} parentId - Historical parent identifier retained for API compatibility.
 * @param {Object} navigator - Optional navigator for card activation.
 * @returns {void}
 */
export function renderLegacyElements(items, container, type, parentId, navigator) {
	void parentId;
	if (!container) return;
	const fragment = document.createDocumentFragment();
	for (const item of Array.isArray(items) ? items : []) {
		fragment.append(legacyCard(item, type, navigator));
	}
	container.replaceChildren(fragment);
}
