
// B"H
import { createElement } from "/scripts/awtsmoos/ui/basic.js";
import { handleDragStart, handleDragOver, handleDragLeave, handleDrop } from "../utils/dragDrop.js";
import { showContextMenu } from '/os/contextMenuManager.js';
import { getJsIcon, getCssIcon, getHtmlIcon, getFileIcon, getFolderIcon } from "../utils/icons.js";

export default function createFileView({ state, os, onNavigate, onRefresh, system, onEnterSelectionMode, onExitSelectionMode }) {
    const body = createElement({ 
        tag: "div", 
        attributes: { class: "file-explorer-body" },
        on: {
            dragover: handleDragOver,
            dragleave: handleDragLeave,
            drop: (e) => handleDrop(e, state.currentPath, os, system, onRefresh),
            contextmenu: (e) => {
                 if(e.target === body) {
                     // Background context menu can go here
                 }
            }
        }
    });

    // Helper to inject SVG string into element style or HTML
    const getIconSvg = (itemName, isFolder) => {
        if (isFolder || itemName.endsWith('.folder') || itemName === 'desktop.folder') return getFolderIcon();
        if (itemName.endsWith('.js')) return getJsIcon();
        if (itemName.endsWith('.css')) return getCssIcon();
        if (itemName.endsWith('.html')) return getHtmlIcon();
        return getFileIcon();
    };

    const performOpenAction = async (targetPath, item, isFolder) => {
        if (isFolder) {
            onNavigate(targetPath === '/' ? item : `${targetPath}/${item}`);
        } else {
            const content = await os.db.Laynin(targetPath, item);
            os.addWindow({ title: item, content, path: targetPath, os });
        }
    };

    const toggleSort = (field) => {
        if (state.sort.by === field) {
            state.sort.order = state.sort.order === 'asc' ? 'desc' : 'asc';
        } else {
            state.sort.by = field;
            state.sort.order = 'asc';
        }
        render();
    };

    const render = async () => {
        body.innerHTML = '';
        body.className = `file-explorer-body ${state.viewMode}-view`;
        
        let items = [];
        if (state.currentPath === '/') {
            const rawItems = await os.db.getAllStoreNames();
            items = rawItems.map(i => (typeof i === 'string' ? {name: i, type: 'directory'} : i));
            items = items.filter(item => item.name && !item.name.startsWith('.'));
        } else {
            items = await os.db.getAllKeys(state.currentPath);
        }

        // Sorting Logic
        items.sort((a, b) => {
            const aName = a.name || "";
            const bName = b.name || "";
            const aIsFolder = a.type === 'directory' || aName.endsWith('.folder');
            const bIsFolder = b.type === 'directory' || bName.endsWith('.folder');
            
            // Always keep folders on top unless sorting specifically by type
            // (Standard OS behavior often keeps folders on top)
            if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;

            let valA, valB;
            
            switch (state.sort.by) {
                case 'date':
                    // Default to 0 if modified date is missing
                    valA = a.modified || 0;
                    valB = b.modified || 0;
                    break;
                case 'type':
                    valA = aIsFolder ? 'folder' : (aName.split('.').pop() || '');
                    valB = bIsFolder ? 'folder' : (bName.split('.').pop() || '');
                    break;
                case 'name':
                default:
                    valA = aName.toLowerCase();
                    valB = bName.toLowerCase();
                    break;
            }

            if (valA < valB) return state.sort.order === 'asc' ? -1 : 1;
            if (valA > valB) return state.sort.order === 'asc' ? 1 : -1;
            return 0;
        });

        if (state.viewMode === 'details') renderDetails(items);
        else renderIcons(items);
    };

    const renderIcons = (items) => {
        if (items.length === 0) {
            body.innerHTML = '<div class="empty-folder-state">Folder is empty</div>';
            return;
        }

        items.forEach(item => {
            const itemName = item.name;
            const isFolder = item.type === 'directory' || itemName.endsWith('.folder');
            const itemFullPath = state.currentPath === '/' ? itemName : `${state.currentPath}/${itemName}`;

            const itemDiv = createElement({
                tag: 'div',
                attributes: { class: 'file-item icon', draggable: 'true', 'data-path': itemFullPath },
                children: [
                    { tag: 'div', attributes: { class: 'icon-img' }, html: getIconSvg(itemName, isFolder) },
                    { tag: 'span', html: itemName }
                ],
                on: {
                    dragstart: (e) => handleDragStart(e, itemFullPath, itemDiv.classList.contains('selected'), body),
                    dragover: isFolder ? handleDragOver : null,
                    dragleave: isFolder ? handleDragLeave : null,
                    drop: isFolder ? (e) => handleDrop(e, itemFullPath, os, system, onRefresh) : null,
                    click: (e) => {
                        e.stopPropagation();
                        if (state.selectionMode) {
                            itemDiv.classList.toggle('selected');
                            if (body.querySelectorAll('.selected').length === 0) onExitSelectionMode();
                        } else {
                            performOpenAction(state.currentPath, itemName, isFolder);
                        }
                    },
                    contextmenu: event => {
                        if (!state.selectionMode) {
                            body.querySelectorAll('.file-item.selected').forEach(el => el.classList.remove('selected'));
                            itemDiv.classList.add('selected');
                        }
                        showContextMenu({ 
                            os, event, path: state.currentPath, title: itemName, isFolder, 
                            onRefresh, onOpen: () => performOpenAction(state.currentPath, itemName, isFolder),
                            onEnterSelectionMode: () => onEnterSelectionMode(itemFullPath)
                        });
                    }
                }
            });
            body.appendChild(itemDiv);
        });
    };

    const renderDetails = (items) => {
        body.style.setProperty('--grid-cols', state.columnWidths.join(' '));
        
        // Header
        const header = createElement({ tag: 'div', attributes: { class: 'details-header' } });
        
        const createHeaderCell = (name, field) => {
            const isSorted = state.sort.by === field;
            const arrow = isSorted ? (state.sort.order === 'asc' ? ' ↑' : ' ↓') : '';
            return createElement({
                tag: 'div',
                attributes: { class: `header-cell ${isSorted ? 'active-sort' : ''}` },
                html: name + arrow,
                on: { click: () => toggleSort(field) }
            });
        };

        header.append(
            createHeaderCell('Name', 'name'),
            createHeaderCell('Date Modified', 'date'),
            createHeaderCell('Type', 'type')
        );
        
        body.appendChild(header);

        if (items.length === 0) {
            body.appendChild(createElement({ tag: 'div', attributes: { class: 'empty-folder-state' }, html: 'Folder is empty' }));
            return;
        }

        items.forEach((item, index) => {
            const itemName = item.name;
            const isFolder = item.type === 'directory' || itemName.endsWith('.folder');
            const itemFullPath = state.currentPath === '/' ? itemName : `${state.currentPath}/${itemName}`;
            const type = isFolder ? 'Folder' : (itemName.split('.').pop().toUpperCase() + ' File');
            const date = item.modified ? new Date(item.modified).toLocaleString() : "--";
            
            const row = createElement({
                tag: 'div', 
                attributes: { 
                    class: 'details-row', 
                    draggable: 'true', 
                    'data-path': itemFullPath,
                    style: `animation-delay: ${index * 0.03}s` // Staggered animation
                },
                children: [
                    { tag: 'div', attributes: { class: 'row-cell name-cell' }, children: [
                        { tag: 'div', attributes: { class: `small-icon` }, html: getIconSvg(itemName, isFolder) },
                        { tag: 'span', html: itemName }
                    ]},
                    { tag: 'div', html: date, attributes: { class: 'row-cell' } },
                    { tag: 'div', html: type, attributes: { class: 'row-cell' } }
                ],
                on: { 
                    dragstart: (e) => handleDragStart(e, itemFullPath, row.classList.contains('selected'), body),
                    dragover: isFolder ? handleDragOver : null,
                    dragleave: isFolder ? handleDragLeave : null,
                    drop: isFolder ? (e) => handleDrop(e, itemFullPath, os, system, onRefresh) : null,
                    click: (e) => {
                        e.stopPropagation();
                        if (state.selectionMode) {
                            row.classList.toggle('selected');
                            if (body.querySelectorAll('.selected').length === 0) onExitSelectionMode();
                        } else {
                            performOpenAction(state.currentPath, itemName, isFolder);
                        }
                    },
                    contextmenu: event => {
                         if (!state.selectionMode) {
                            body.querySelectorAll('.details-row.selected').forEach(el => el.classList.remove('selected'));
                            row.classList.add('selected');
                        }
                        showContextMenu({ 
                            os, event, path: state.currentPath, title: itemName, isFolder, 
                            onRefresh, onOpen: () => performOpenAction(state.currentPath, itemName, isFolder),
                            onEnterSelectionMode: () => onEnterSelectionMode(itemFullPath)
                        });
                    }
                }
            });
            body.appendChild(row);
        });
    };

    return { dom: body, render };
}
