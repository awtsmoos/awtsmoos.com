// B"H
/**
 * @module CommandSigil
 * @description
 * Chapter 112: Manage becomes a clean bottom sheet.
 *
 * The menu no longer appears halfway under the card or behind the bottom nav.
 * It is a fixed, touch-friendly command vessel with working Share, Edit,
 * Delete, and Clear Contents actions.
 */

import { ScribeOfManifestation } from '../engine/scribe-of-manifestation.js';
import { openModal } from '../modal.js';

let currentMenuVessel = null;

export function showContextMenu(triggerElement, item, navigator) {
    closeCurrentMenu();
    currentMenuVessel = ScribeOfManifestation.manifest(getMenuBlueprint(item, navigator));
    document.body.appendChild(currentMenuVessel);
    currentMenuVessel.querySelector('.context-menu-veil')?.addEventListener('click', closeCurrentMenu, { once: true });
    setTimeout(() => document.addEventListener('keydown', closeOnEscape, { once: true }), 10);
}

export function closeCurrentMenu() {
    if (!currentMenuVessel) return;
    currentMenuVessel.remove();
    currentMenuVessel = null;
}

function closeOnEscape(event) {
    if (event.key === 'Escape') closeCurrentMenu();
}

function getMenuBlueprint(item, navigator) {
    const editKind = item.type === 'series' ? 'series' : 'post';
    const actions = {
        'Share': () => navigator.handleShareClick(item),
        'Edit Details': () => openModal(editKind, navigator, { mode: item.type === 'series' ? 'edit' : 'create', seriesId: item.id, inputId: item.id, title: item.title || '', description: item.description || item.content || '', contentType: item.contentType || 'post' }),
        'Delete': () => navigator.deleteSingleItem(item)
    };
    if (item.type === 'series') actions['Clear Contents'] = () => navigator.clearSingleItem(item);
    return { tag: 'div', attr: { class: 'context-menu-layer manifested' }, children: [{ tag: 'button', attr: { type: 'button', class: 'context-menu-veil', 'aria-label': 'Close menu' } }, { tag: 'div', attr: { class: 'awtsmoos-context-menu context-menu', role: 'menu' }, children: Object.entries(actions).map(([label, fn]) => command(label, fn)) }] };
}

function command(label, fn) {
    return { tag: 'button', attr: { type: 'button', class: `context-menu-item ${label === 'Delete' ? 'danger-text' : ''}`, role: 'menuitem' }, children: [label], events: { click: event => { event.stopPropagation(); fn(); closeCurrentMenu(); } } };
}
