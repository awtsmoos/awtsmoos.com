// /heichelos/heichel/modules/contextmenu.js
// B"H 
//- Logic for the actions context menu, restoring the missing feature.
import {notify} from './ui.js';
import {appState} from '../state.js';
import { openModal } from './modal.js';
// Added import for appState

let currentMenu = null;
let navigatorInstance;

function closeCurrentMenu() {
    if (currentMenu) {
        currentMenu.remove();
        currentMenu = null;
        document.body.removeEventListener('click', closeCurrentMenu);
        window.removeEventListener('resize', closeCurrentMenu);
    }
}

export function showContextMenu(iconElement, item, navigator) {
    closeCurrentMenu();
    // Close any old menu
    if (!navigatorInstance)
        navigatorInstance = navigator;

    const menu = document.createElement('div');
    menu.className = 'context-menu';

    // Share link needs navigator instance clipboard API, but it might not be available
    // Fallback to basic copy. `navigator.clipboard` is a browser feature.
    const shareAction = () => {
        const url = item.type === 'series' ? `${window.location.origin}${window.location.pathname}?view=series&series=${item.id}` : `${window.location.origin}/heichelos/${appState.heichelId}/series/${item.parentId}/${item.id}`;
        window.navigator.clipboard.writeText(url).then( () => notify('Link copied to clipboard!', 'success'), () => notify('Could not copy link.', 'error'));
    }
    ;

    const actions = {
        'Delete': () => navigatorInstance.deleteSingleItem(item),
        'Edit': () => openModal(item.type === 'series' ? 'series' : 'post', navigatorInstance, { mode: item.type === 'series' ? 'edit' : 'create', seriesId: item.id, inputId: item.id, title: item.title || '', description: item.description || item.content || '', contentType: item.contentType || 'post' }),
        'Share': shareAction
    };
    
    if(item.type == "series") {
	    actions["Clear"] = () => navigatorInstance.clearSingleItem(item);
    }
    

    for (const [label,action] of Object.entries(actions)) {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        if (label === 'Delete')
            menuItem.style.color = 'var(--danger-color)';
        menuItem.textContent = label;
        menuItem.onclick = (e) => {
            e.stopPropagation();
            action();
            closeCurrentMenu();
        }
        ;
        menu.appendChild(menuItem);
    }

    document.body.appendChild(menu);
    const rect = iconElement.getBoundingClientRect();

    // FIX: Calculate position relative to document, not viewport, by adding scroll offsets.
    menu.style.position = 'absolute';
    menu.style.top = `${rect.bottom + window.scrollY + 5}px`;
    menu.style.left = `${rect.right + window.scrollX - menu.offsetWidth}px`;
    // Align to the right of the icon
    menu.style.opacity = "1";
    currentMenu = menu;
    // Add listeners to close the menu
    setTimeout( () => {
        // Timeout prevents immediate self-closing
        
        document.body.addEventListener('click', closeCurrentMenu, {
            once: true
        });
        window.addEventListener('resize', closeCurrentMenu, {
            once: true
        });
    }
    , 0);
}
