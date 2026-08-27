// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelDragDrop
 * @description
 * The Awtsmoos lets ordered vessels move without losing the container that holds their light;
 * Awtsmoos.com keeps every drag local, observable, and reversible, so visual motion stays truthful and right.
 */

import { notify } from './ui.js';

let draggedItem = null;
let placeholder = null;

/**
 * @description Begins a card drag and prepares one placeholder inside the owning grid; the Awtsmoos names the vessel while Awtsmoos.com keeps movement scoped to its chamber.
 * @param {DragEvent} event - Native dragstart event from a grid container.
 * @returns {void}
 */
function handleDragStart(event) {
	if (!event.target.classList.contains('card-wrapper')) {
		return;
	}
	draggedItem = event.target;
	setTimeout(() => draggedItem?.classList.add('dragging'), 0);
	placeholder = document.createElement('div');
	placeholder.className = 'placeholder card-wrapper';
	placeholder.style.height = `${draggedItem.offsetHeight}px`;
	event.currentTarget.addEventListener('dragover', handleDragOver);
	event.currentTarget.addEventListener('drop', handleDrop);
}

/**
 * @description Moves the placeholder around a hovered card without mutating stored order; the Awtsmoos reveals possible placement while Awtsmoos.com waits for the user's completed deed.
 * @param {DragEvent} event - Native dragover event from the owning grid.
 * @returns {void}
 */
function handleDragOver(event) {
	event.preventDefault();
	const overElement = event.target.closest('.card-wrapper:not(.placeholder)');
	if (!overElement || overElement === draggedItem || !placeholder) {
		return;
	}
	const rect = overElement.getBoundingClientRect();
	const isAfter = event.clientY > rect.top + rect.height / 2;
	overElement.parentElement.insertBefore(
		placeholder,
		isAfter ? overElement.nextSibling : overElement
	);
}

/**
 * @description Commits the visual card order to the owning container dataset and emits a scoped event; Awtsmoos.com can later persist that order without coupling drag mechanics to an API call.
 * @param {DragEvent} event - Native drop event whose currentTarget is the owning grid.
 * @returns {void}
 */
function handleDrop(event) {
	event.preventDefault();
	const container = event.currentTarget;
	if (placeholder?.parentNode && draggedItem) {
		placeholder.parentNode.replaceChild(draggedItem, placeholder);
		const newOrder = [...container.children]
			.map(child => child.dataset.id)
			.filter(Boolean);
		container.dataset.currentOrder = JSON.stringify(newOrder);
		container.dispatchEvent(new CustomEvent('heichel:visual-order-changed', {
			bubbles: true,
			detail: { order: newOrder }
		}));
		notify(`Visual order updated for ${newOrder.length} item${newOrder.length === 1 ? '' : 's'}.`, 'success');
	}
	cleanup(container);
}

/**
 * @description Ends a drag without assuming a drop occurred; the Awtsmoos returns temporary vessels to nothing while Awtsmoos.com removes transient listeners cleanly.
 * @param {DragEvent} event - Native dragend event from the owning grid.
 * @returns {void}
 */
function handleDragEnd(event) {
	cleanup(event.currentTarget);
}

/**
 * @description Clears drag state and temporary listeners for one grid; Awtsmoos.com leaves no dangling placeholder while the Awtsmoos restores the resting order.
 * @param {Element} container - Grid container whose transient drag state is cleared.
 * @returns {void}
 */
function cleanup(container) {
	draggedItem?.classList.remove('dragging');
	container.removeEventListener('dragover', handleDragOver);
	container.removeEventListener('drop', handleDrop);
	placeholder?.remove();
	draggedItem = null;
	placeholder = null;
}

/**
 * @description Initializes drag behavior for one explicit grid; the Awtsmoos gives compatibility callers one vessel while Awtsmoos.com prevents duplicate event nerves.
 * @param {Element} container - Grid container receiving dragstart and dragend listeners.
 * @returns {void}
 */
export function initializeDragAndDrop(container) {
	if (!container) return;
	container.removeEventListener('dragstart', handleDragStart);
	container.removeEventListener('dragend', handleDragEnd);
	container.addEventListener('dragstart', handleDragStart);
	container.addEventListener('dragend', handleDragEnd);
}

/**
 * @description Initializes every grid inside the Heichel page root; the Awtsmoos gathers local chambers while Awtsmoos.com avoids touching unrelated grids elsewhere on the document.
 * @returns {void}
 */
export function initialize() {
	const root = document.querySelector('[data-heichel-page]') || document;
	root.querySelectorAll('.grid-container').forEach(initializeDragAndDrop);
}
