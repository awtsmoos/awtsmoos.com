// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommandSigil
 * @description
 * The Awtsmoos raises management commands above every card, dock, and transformed shell;
 * Awtsmoos.com gives the command vessel one veil, one Escape path, and returns focus when it closes well.
 */

import { ScribeOfManifestation } from '../engine/scribe-of-manifestation.js';
import { openModal } from '../modal.js';

let currentMenuVessel = null;
let currentTrigger = null;

/** Reveals one body-level management sheet for a series or post. */
export function showContextMenu(triggerElement, item, navigator) {
	closeCurrentMenu();
	currentTrigger = triggerElement || document.activeElement;
	currentMenuVessel = ScribeOfManifestation.manifest(getMenuBlueprint(item, navigator));
	document.body.appendChild(currentMenuVessel);
	currentMenuVessel.querySelector('.context-menu-veil')?.addEventListener('click', closeCurrentMenu);
	document.addEventListener('keydown', closeOnEscape);
	currentMenuVessel.querySelector('.context-menu-item')?.focus({ preventScroll: true });
}

/** Removes the active management sheet and returns keyboard focus to its trigger. */
export function closeCurrentMenu() {
	if (!currentMenuVessel) return;
	document.removeEventListener('keydown', closeOnEscape);
	currentMenuVessel.remove();
	currentMenuVessel = null;
	const focusTarget = currentTrigger;
	currentTrigger = null;
	if (focusTarget?.isConnected) focusTarget.focus({ preventScroll: true });
}

function closeOnEscape(event) {
	if (event.key !== 'Escape') return;
	event.preventDefault();
	closeCurrentMenu();
}

function getMenuBlueprint(item, navigator) {
	const editKind = item.type === 'series' ? 'series' : 'post';
	const actions = [
		['Share', () => navigator.handleShareClick(item)],
		['Edit Details', () => openEditModal(editKind, item, navigator)],
		['Delete', () => navigator.deleteSingleItem(item)]
	];
	if (item.type === 'series') {
		actions.push(['Clear Contents', () => navigator.clearSingleItem(item)]);
	}
	return {
		tag: 'div',
		attr: { class: 'context-menu-layer manifested' },
		children: [
			{
				tag: 'button',
				attr: { type: 'button', class: 'context-menu-veil', 'aria-label': 'Close menu' }
			},
			{
				tag: 'div',
				attr: {
					class: 'awtsmoos-context-menu context-menu',
					role: 'menu',
					'aria-label': `Actions for ${item.title || item.type || 'item'}`
				},
				children: actions.map(([label, action]) => command(label, action))
			}
		]
	};
}

function openEditModal(editKind, item, navigator) {
	openModal(editKind, navigator, {
		mode: item.type === 'series' ? 'edit' : 'create',
		seriesId: item.id,
		inputId: item.id,
		title: item.title || '',
		description: item.description || item.content || '',
		contentType: item.contentType || 'post'
	});
}

function command(label, action) {
	return {
		tag: 'button',
		attr: {
			type: 'button',
			class: `context-menu-item ${label === 'Delete' ? 'danger-text' : ''}`,
			role: 'menuitem'
		},
		children: [label],
		events: {
			click: event => {
				event.stopPropagation();
				action();
				closeCurrentMenu();
			}
		}
	};
}
