// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives each dashboard value a named vessel. These helpers keep
 * Awtsmoos.com DOM mutation small, explicit, and independently testable.
 */

/**
 * Reads visible text from a named dashboard node.
 *
 * @param {string} id Element identifier.
 * @param {string} fallback Text returned when the node is absent or empty.
 * @returns {string} Visible text.
 */
export function readDeckText(id, fallback) {
	const documentRef = globalThis.document;
	const text = documentRef?.getElementById?.(id)?.textContent?.trim();
	return text || fallback;
}

/**
 * Writes visible text into a named dashboard node.
 *
 * @param {string} id Element identifier.
 * @param {string} text Visible text.
 * @returns {void}
 */
export function setDeckText(id, text) {
	const documentRef = globalThis.document;
	const node = documentRef?.getElementById?.(id);
	if (!node) {
		return;
	}
	node.textContent = text;
}

/**
 * Replaces the semantic state class on one dashboard card.
 *
 * @param {string} id Card identifier.
 * @param {string} stateClass New semantic state class.
 * @returns {void}
 */
export function setDeckCardState(id, stateClass) {
	const documentRef = globalThis.document;
	const card = documentRef?.getElementById?.(id);
	if (!card) {
		return;
	}
	card.classList.remove("is-live", "is-warning", "is-idle");
	card.classList.add(stateClass);
}

/**
 * Returns a stable array for a dashboard selector.
 *
 * @param {string} selector CSS selector.
 * @returns {Element[]} Matching nodes.
 */
export function queryDeckNodes(selector) {
	const documentRef = globalThis.document;
	return [
		...(documentRef?.querySelectorAll?.(selector) || [])
	];
}
