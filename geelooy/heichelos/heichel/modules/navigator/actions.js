
/**
 * B"H
 * @module GuidanceActions
 * @description
 * This module defines the active forces (Gevurot) within the 
 * Library. Actions such as Deleting or Creating are contractions 
 * that shape the content of the Realm. Every action here 
 * influences the manifest world through the API conduits.
 */

import { appState } from '../state.js';
import * as api from '../api.js';
import * as ui from '../ui.js';

/**
 * @function handleDelete
 * @description Initiates the ritual of removal from the Realm.
 */
export async function handleDelete(navigator, itemsInput, clear = false) {
    const items = Array.isArray(itemsInput) ? itemsInput : [itemsInput];
    if (!items.length) return;
    
    const label = clear ? "Purify (Clear)" : "Return to Void (Delete)";
    const named = items.length === 1
        ? `"${items[0].title || items[0].id}"`
        : `these ${items.length} sparks`;
    const cascadeNote = !clear && items.some(i => i.type === 'post')
        ? ' Its comments will be removed too.'
        : (!clear && items.some(i => i.type === 'series')
            ? ' Everything inside it — posts and their comments — will be removed too.'
            : '');
    // B"H 2026-11-26 (Revelation fix, section H): the native confirm()
    // gate was a silent dead end -- inside the shell stage / automated
    // surfaces it resolves as a dismissal with no dialog, no toast and no
    // deletion, so owner Delete looked inert (proven in the publish-proof
    // run: 5 owner attempts, nothing). Confirmation is now an in-page
    // sheet the owner actually sees and taps.
    if (!await confirmAction(`Are you certain you wish to ${label} ${named}?${cascadeNote} This cannot be undone.`, label)) return;

    ui.notify(`Processing ${label}...`, 'info');

    const ritual = clear ? api.clearSeries : api.deleteContent;

    let results;
    try {
        results = await ritual({
            heichelId: appState.heichelId,
            aliasId: window.curAlias,
            itemsToDelete: items,
        });
    } catch (error) {
        ui.notify(`The removal could not reach the server. Nothing was deleted. (${error?.message || 'network error'})`, 'error');
        return;
    }

    const brokenSparks = results.filter(r => !r.success);
    if (brokenSparks.length > 0) {
        ui.notify(`${brokenSparks.length} removals were resisted by the void.`, 'error');
    } else {
        ui.notify('Manifestation successfully updated.', 'success');
    }

    // Determine if we need to retreat from a deleted room
    const currentDestroyed = items.some(i => i.type === 'series' && i.id === appState.currentSeries);
    if (currentDestroyed) {
        const parent = appState.breadcrumb.length > 0 
            ? appState.breadcrumb[appState.breadcrumb.length - 1] 
            : null;
        await navigator.navigateTo(parent ? parent.id : 'root');
    } else {
        await navigator.loadContent(appState.currentSeries);
    }
}

/**
 * @function handleShare
 * @description Generates a path of light for others to follow.
 */
export function handleShare(item) {
    const url = item.type === 'series' 
        ? `${window.location.origin}${window.location.pathname}?view=series&series=${item.id}` 
        : `${window.location.origin}/heichelos/${appState.heichelId}/series/${item.parentId}/${item.id}`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url)
            .then(() => ui.notify('The Path has been copied.', 'success'))
            .catch(() => ui.notify('Path copying failed.', 'error'));
    } else {
        window.prompt("Copy this path to share the Revelation:", url);
    }
}

/**
 * B"H 2026-11-26 (Revelation fix, section H): in-page confirmation sheet.
 * Resolves true only when the owner taps the danger button; the veil,
 * Escape, and Cancel all resolve false. Never a native dialog.
 */
export function confirmAction(message, confirmLabel = 'Delete') {
    return new Promise(resolve => {
        const layer = document.createElement('div');
        layer.className = 'awtsmoos-confirm-layer';
        layer.innerHTML =
            '<button type="button" class="awtsmoos-confirm-veil" aria-label="Cancel"></button>' +
            '<div class="awtsmoos-confirm-card" role="alertdialog" aria-modal="true" aria-label="Confirm removal">' +
                '<p class="awtsmoos-confirm-text"></p>' +
                '<div class="awtsmoos-confirm-actions">' +
                    '<button type="button" class="awtsmoos-confirm-cancel">Cancel</button>' +
                    '<button type="button" class="awtsmoos-confirm-danger"></button>' +
                '</div>' +
            '</div>';
        layer.querySelector('.awtsmoos-confirm-text').textContent = message;
        layer.querySelector('.awtsmoos-confirm-danger').textContent = confirmLabel;
        const finish = value => {
            document.removeEventListener('keydown', onKey);
            layer.remove();
            resolve(value);
        };
        const onKey = event => { if (event.key === 'Escape') finish(false); };
        layer.querySelector('.awtsmoos-confirm-veil').addEventListener('click', () => finish(false));
        layer.querySelector('.awtsmoos-confirm-cancel').addEventListener('click', () => finish(false));
        layer.querySelector('.awtsmoos-confirm-danger').addEventListener('click', () => finish(true));
        document.addEventListener('keydown', onKey);
        document.body.appendChild(layer);
        layer.querySelector('.awtsmoos-confirm-danger').focus({ preventScroll: true });
    });
}
