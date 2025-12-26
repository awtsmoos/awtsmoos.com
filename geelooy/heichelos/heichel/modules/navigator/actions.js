// /heichelos/heichel/modules/navigator/actions.js
// B"H
import { appState } from '../../state.js';
import * as api from '../../api.js';
import * as ui from '../ui.js';
import { openModal } from '../modal.js';

export function handleCreateSeries(navigator) {
    openModal('series', navigator);
}

export function handleCreatePost(navigator) {
    window.open(`/heichelos/${appState.heichelId}/submit?parentSeriesId=${appState.currentSeries}`, '_blank');
}

export async function handleDelete(navigator, itemsInput, clear = false) {
    const items = Array.isArray(itemsInput) ? itemsInput : [itemsInput];
    if (!items || items.length === 0) return;
    
    const count = items.length;
    const desc = count === 1 ? `"${items[0].title || items[0].id}"` : `${count} items`;
    const action = clear ? "CLEAR contents of" : "DELETE";
    
    if (!confirm(`Are you sure you want to ${action} ${desc}? This is irreversible.`)) return;
    
    ui.notify(`${action} in progress...`, 'info');

    const func = clear ? api.clearSeries : api.deleteContent;
    
    const results = await func({
        heichelId: appState.heichelId,
        aliasId: window.curAlias,
        itemsToDelete: items,
    });

    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
        ui.notify(`${failures.length} operations failed.`, 'error');
        console.error("Deletion failures:", failures);
    } else {
        ui.notify('Operations successful.', 'success');
    }

    // Navigation logic
    const didDeleteCurrent = items.some(item => item.type === 'series' && item.id === appState.currentSeries);
    if (didDeleteCurrent) {
        const parent = appState.breadcrumb.length > 0 ? appState.breadcrumb[appState.breadcrumb.length - 1] : null;
        await navigator.navigateTo(parent ? parent.id : 'root');
    } else {
        await navigator.loadContent(appState.currentSeries);
    }
}

export function handleShare(navigator, item) {
    const url = item.type === 'series' 
        ? `${window.location.origin}${window.location.pathname}?view=series&series=${item.id}` 
        : `${window.location.origin}/heichelos/${appState.heichelId}/series/${item.parentId}/${item.id}`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url)
            .then(() => ui.notify('Link copied!', 'success'))
            .catch(() => ui.notify('Failed to copy link.', 'error'));
    } else {
        // Fallback for old browsers
        const ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        ui.notify('Link copied!', 'success');
    }
}
