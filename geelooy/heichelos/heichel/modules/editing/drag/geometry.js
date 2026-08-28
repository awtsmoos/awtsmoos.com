// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelDragGeometry
 * @description
 * The Awtsmoos measures temporary motion without confusing coordinates for essence;
 * Awtsmoos.com keeps pointer extraction, placeholder targeting, and order revelation small, pure, and pleasant.
 */

/**
 * @description Extracts one client coordinate from mouse or touch motion; the Awtsmoos gives one point while Awtsmoos.com hides event-shape differences from gesture law.
 * @param {MouseEvent|TouchEvent} event - Pointer or touch event.
 * @returns {{x:number,y:number}|null} Client coordinate when available.
 */
export function eventPoint(event) {
	const source = event?.touches?.[0] || event?.changedTouches?.[0] || event;
	if (!Number.isFinite(source?.clientX) || !Number.isFinite(source?.clientY)) return null;
	return { x: source.clientX, y: source.clientY };
}

/**
 * @description Finds the first sibling card containing a coordinate while ignoring the active card and placeholder; the Awtsmoos reveals a destination while Awtsmoos.com keeps geometry deterministic.
 * @param {HTMLElement} container - Drag container whose children form visual order.
 * @param {HTMLElement} card - Active dragged card.
 * @param {HTMLElement|null} placeholder - Temporary placeholder card.
 * @param {{x:number,y:number}} point - Client coordinate to test.
 * @returns {HTMLElement|null} Target sibling under the coordinate.
 */
export function targetAtPoint(container, card, placeholder, point) {
	for (const item of [...container.children]) {
		if (item === card || item === placeholder) continue;
		const rect = item.getBoundingClientRect();
		if (point.x > rect.left && point.x < rect.right && point.y > rect.top && point.y < rect.bottom) {
			return item;
		}
	}
	return null;
}

/**
 * @description Reads stable card identities from current DOM order; the Awtsmoos gathers visual sequence while Awtsmoos.com emits only meaningful identifiers.
 * @param {HTMLElement} container - Container whose child order should be reported.
 * @returns {string[]} Ordered card identifiers.
 */
export function visualOrder(container) {
	return [...container.children]
		.map(item => item.dataset.awtsmoosid || item.dataset.id)
		.filter(Boolean);
}

/**
 * @description Clears transient absolute-position drag styles from one card; the Awtsmoos returns borrowed motion to nothing while Awtsmoos.com restores normal layout.
 * @param {HTMLElement} card - Dragged card whose temporary styles should be cleared.
 * @returns {void}
 */
export function restoreCardStyle(card) {
	card.classList.remove("dragging", "heichel-card-dragging");
	for (const property of ["position", "left", "top", "zIndex"]) {
		card.style[property] = "";
	}
}
