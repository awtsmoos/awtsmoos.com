//B"H

let callbacks = {};
let pendingItems = [];
const selectedItems = new Map();
let selectionRenderer = () => {};

/**
 * B"H
 * Playlist state is the hidden river beneath the modal palace: callbacks,
 * pending sparks, selected sparks, and the one render hook that lets views stay
 * separate without circular hunger.
 * @param {object} value Application callback table.
 * @returns {void}
 */
export function setCallbacks(value = {}) { callbacks = value || {}; }

/** @returns {object} The current callback table. */
export function getCallbacks() { return callbacks; }

/** @param {Array<object>} items Items waiting for picker add. @returns {void} */
export function setPendingItems(items = []) { pendingItems = items.filter(Boolean); }

/** @returns {Array<object>} Pending picker items. */
export function getPendingItems() { return pendingItems; }

/** @param {Function} renderer Sticky selection renderer. @returns {void} */
export function setSelectionRenderer(renderer) { selectionRenderer = typeof renderer === 'function' ? renderer : () => {}; }

/** @returns {void} Repaint the selected bar through the registered gate. */
export function requestSelectionRender() { selectionRenderer(); }

/** @returns {Array<object>} Selected playlist items. */
export function selectedPlaylistItems() { return [...selectedItems.values()]; }

/** @param {string} key Stable item key. @param {object} item Playlist item. @param {boolean} checked Desired state. @returns {void} */
export function setSelectedItem(key, item, checked) { checked ? selectedItems.set(key, item) : selectedItems.delete(key); }

/** @returns {void} Clear all selected sparks. */
export function clearSelectedItems() { selectedItems.clear(); }

/** @returns {number} Selected item count. */
export function selectedCount() { return selectedItems.size; }
