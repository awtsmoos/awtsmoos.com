
/**
 * B"H
 * @module CommandSigil
 * @description
 * When the seeker reaches out to a specific spark (card), 
 * the Command Sigil (Context Menu) emerges from the hidden depths.
 */

import { ScribeOfManifestation } from '../engine/scribe-of-manifestation.js';
import { appState } from '../state.js';
import { notify } from './render/toast.js';
import { openModal } from '../modal.js';

let currentMenuVessel = null;

/**
 * @function showContextMenu
 * @description Summons the context menu into the manifest world.
 */
export function showContextMenu(triggerElement, item, navigator) {
    // 1. Return existing menu to the void
    closeCurrentMenu();

    // 2. Define the Command Blueprint
    const blueprint = getMenuBlueprint(item, navigator);

    // 3. Manifest the Blueprint
    currentMenuVessel = ScribeOfManifestation.manifest(blueprint);
    document.body.appendChild(currentMenuVessel);

    // 4. Position the Vessel according to physical laws
    const rect = triggerElement.getBoundingClientRect();
    currentMenuVessel.style.position = 'absolute';
    currentMenuVessel.style.top = `${rect.bottom + window.scrollY + 5}px`;
    currentMenuVessel.style.left = `${rect.right + window.scrollX - 150}px`;

    // 5. Establish a timer to prevent immediate self-destruction
    setTimeout(() => {
        document.addEventListener('click', closeCurrentMenu, { once: true });
    }, 10);
}

/**
 * @function closeCurrentMenu
 * @description Dismantles the manifest menu vessel.
 */
export function closeCurrentMenu() {
    if (currentMenuVessel) {
        currentMenuVessel.remove();
        currentMenuVessel = null;
    }
}

/**
 * @private
 * @function getMenuBlueprint
 */
function getMenuBlueprint(item, navigator) {
    const actions = {
        'Share': () => navigator.handleShareClick(item),
        'Edit Details': () => openModal(item.type === 'series' ? 'series' : 'post', navigator, { mode: item.type === 'series' ? 'edit' : 'create', seriesId: item.id, inputId: item.id, title: item.title || '', description: item.description || item.content || '', contentType: item.contentType || 'post' }),
        'Delete': () => navigator.deleteSingleItem(item)
    };

    if (item.type === 'series') {
        actions['Clear Contents'] = () => navigator.clearSingleItem(item);
    }

    return {
        tag: 'div',
        attr: { class: 'awtsmoos-context-menu manifested' },
        children: Object.entries(actions).map(([label, fn]) => ({
            tag: 'div',
            attr: { 
                class: `context-menu-item ${label === 'Delete' ? 'danger-text' : ''}` 
            },
            children: [label],
            events: {
                click: (e) => {
                    e.stopPropagation();
                    fn();
                    closeCurrentMenu();
                }
            }
        }))
    };
}
