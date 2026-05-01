
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
    if (!confirm(`Are you certain you wish to ${label} these ${items.length} sparks?`)) return;
    
    ui.notify(`Processing ${label}...`, 'info');

    const ritual = clear ? api.clearSeries : api.deleteContent;
    
    const results = await ritual({
        heichelId: appState.heichelId,
        aliasId: window.curAlias,
        itemsToDelete: items,
    });

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
