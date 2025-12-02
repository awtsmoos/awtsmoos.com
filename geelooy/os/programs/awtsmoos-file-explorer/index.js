/*B"H*/
import {
    createElement
} from "/scripts/awtsmoos/ui/basic.js"
import myStyles from "./styles.js";
import {
    importFiles
} from  "/os/helpers/scripts.js"


import {
showContextMenu,
 showGenericContextMenu
} from '../../contextMenuManager.js';

export default ({
    os,
    path,
    title,
    system
} = {}) => {
    
    // --- State and Variables ---
   const state = {
    // This now correctly uses the full path passed by the OS.
    currentPath: path || '/',

    viewMode: 'icons',
    sort: { by: 'name', order: 'asc' },
    // Default widths for Name, Date, Type
    columnWidths: ['2fr', '1fr', '1fr'],
    selectionMode: false // Track selection mode
};

    let body, sidebar, pathBreadcrumbs, pathInputContainer;
    let buildNode;

    // --- SELECTION MODE HELPERS ---

    // Async to wait for render, and takes initialPath to select the item that was right-clicked
    // REPLACEMENT for enterSelectionMode
    async function enterSelectionMode(initialPath = null) {
        state.selectionMode = true;
        
        // 1. Capture current scroll position
        const scrollPos = body.scrollTop;
        
        // 2. Re-render the view (which wipes the DOM)
        await renderFiles(state.currentPath, body); 
        
        // 3. Restore scroll position
        body.scrollTop = scrollPos;
        
        // 4. Re-apply selection to the item that started it
        if (initialPath) {
            // Find element by the data-path attribute we added
            const el = body.querySelector(`[data-path="${initialPath}"]`);
            if (el) {
                el.classList.add('selected');
            }
        }
        
        renderSelectionActionBar();
    }

    function exitSelectionMode() {
        state.selectionMode = false;
        // Clear visual selection
        body.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
        // Remove Action Bar
        const bar = body.parentElement.querySelector('.selection-action-bar');
        if (bar) bar.remove();
        
        renderFiles(state.currentPath, body); // Re-render to restore normal click behavior
    }

    function renderSelectionActionBar() {
        const existing = body.parentElement.querySelector('.selection-action-bar');
        if (existing) existing.remove();

        const bar = createElement({
            tag: 'div',
            attributes: { class: 'selection-action-bar' },
            children: [
                { tag: 'span', html: 'Selected Items' },
                { tag: 'button', html: 'Cut', on: { click: () => performBatchAction('cut') } },
                { tag: 'button', html: 'Delete', on: { click: () => performBatchAction('delete') } },
                { tag: 'button', html: 'Cancel', attributes: { class: 'cancel-btn' }, on: { click: () => exitSelectionMode() } }
            ]
        });
        
        body.parentElement.appendChild(bar);
    }

    async function performBatchAction(action) {
        const selectedEls = body.querySelectorAll('.selected');
        if (selectedEls.length === 0) return;

        if (action === 'cut') {
            const paths = [];
            const seen = new Set();
            selectedEls.forEach(el => {
                const p = el.dataset.path;
                if (p && !seen.has(p)) {
                    paths.push(p);
                    seen.add(p);
                }
            });

            // Store multiple paths in clipboard
            os.clipboard = {
                action: 'cut',
                paths: paths,
                path: paths[0], // Fallback
                name: paths[0].split('/').pop() 
            };

            // exitSelectionMode will trigger a refresh, showing ghosts
            exitSelectionMode();
        } 
        
        if (action === 'delete') {
            if (confirm(`Delete ${selectedEls.length} items?`)) {
                for (const el of selectedEls) {
                    const pathToDelete = el.dataset.path;
                    const name = pathToDelete.split('/').pop();
                    const parent = pathToDelete.substring(0, pathToDelete.lastIndexOf('/')) || '/';
                    await os.db.deleteFile(parent, name);
                }
                exitSelectionMode();
            }
        }
    }

    // --- Drag and Drop Handlers ---

    const handleDragStart = (e, itemPath, isSelected) => {
        let pathsToMove = [];

        if (isSelected) {
            const selectedEls = body.querySelectorAll('.selected');
            selectedEls.forEach(el => {
                if (el.dataset.path) pathsToMove.push(el.dataset.path);
            });
        } else {
            body.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
            e.target.classList.add('selected');
            pathsToMove = [itemPath];
        }

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/json', JSON.stringify(pathsToMove));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('drag-over');
    };

    const handleDrop = async (e, targetFolderPath) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('drag-over');

        const data = e.dataTransfer.getData('application/json');
        if (!data) return;

        try {
            const sourcePaths = JSON.parse(data);
            if (!Array.isArray(sourcePaths)) return;

            let movedCount = 0;
            for (const src of sourcePaths) {
                const fileName = src.split('/').pop();
                const dest = targetFolderPath === '/' ? fileName : `${targetFolderPath}/${fileName}`;
                const currentParent = src.substring(0, src.lastIndexOf('/')) || '/';
                
                if (src !== dest && currentParent !== targetFolderPath) {
                    await os.db.move(src, dest);
                    movedCount++;
                }
            }

            if (movedCount > 0) {
                renderFiles(state.currentPath, body);
            }
        } catch (err) {
            console.error("Drop failed:", err);
            system.makeToast("Failed to move items: " + err.message);
        }
    };


    // This is the recursive function that draws the sidebar tree.
    buildNode = async (currentPath, parentUl) => {
        parentUl.innerHTML = ''; 
        let items = [];

        if (currentPath === '/') {
            const rawItems = await os.db.getAllStoreNames();
            items = rawItems.map(n => {
                if(typeof n === 'object' && n !== null) return n;
                return { name: n, type: 'directory' };
            });
            items = items.filter(i => i.name && !i.name.startsWith('.'));
        } else {
            try {
                items = await os.db.getAllKeys(currentPath);
            } catch (e) { return; }
        }
        
        items.sort((a, b) => {
            const aName = a.name || "";
            const bName = b.name || "";
            const aIsFolder = a.type === 'directory' || aName.endsWith('.folder') || currentPath === '/';
            const bIsFolder = b.type === 'directory' || bName.endsWith('.folder') || currentPath === '/';
            
            if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;
            return aName.localeCompare(bName);
        });

        for (const itemObj of items) {
            const item = itemObj.name;
            const isFolder = itemObj.type === 'directory' || item.endsWith('.folder') || currentPath === '/';
            const fullPath = currentPath === '/' ? item : `${currentPath}/${item}`;
            
            const displayName = item; 

            const li = createElement({ tag: 'li', attributes: { 'data-full-path': fullPath, class: 'tree-node' }});
            const contentWrapper = createElement({ 
                tag: 'div', 
                attributes: { class: 'tree-node-content' },
                on: {
                    dragover: isFolder ? handleDragOver : null,
                    dragleave: isFolder ? handleDragLeave : null,
                    drop: isFolder ? (e) => handleDrop(e, fullPath) : null
                }
            });
            
            const nameSpan = createElement({ tag: 'span', attributes: { class: 'node-name' }, html: displayName });

            if (isFolder) {
                const toggle = createElement({ tag: 'span', attributes: { class: 'toggle' }, html: '►' });
                contentWrapper.append(toggle, nameSpan);
                const childrenUl = createElement({ tag: 'ul', attributes: { class: 'tree-children collapsed' }});

                const expand = async () => {
                    if (childrenUl.classList.contains('collapsed')) {
                        childrenUl.classList.remove('collapsed');
                        toggle.innerHTML = '▼';
                        await buildNode(fullPath, childrenUl);
                    }
                };
                const collapse = () => {
                    childrenUl.classList.add('collapsed');
                    toggle.innerHTML = '►';
                };
                
                toggle.onclick = (e) => { e.stopPropagation(); childrenUl.classList.contains('collapsed') ? expand() : collapse(); };
                contentWrapper.onclick = (e) => { e.stopPropagation(); navigateTo(fullPath); };
                li.append(contentWrapper, childrenUl);
            } else {
                const fileIconPlaceholder = createElement({ tag: 'span', attributes: { class: 'toggle' } });
                contentWrapper.append(fileIconPlaceholder, nameSpan);
                contentWrapper.onclick = () => performOpenAction(currentPath, item, false);
                li.appendChild(contentWrapper);
            }
            
            contentWrapper.oncontextmenu = event => showContextMenu({ 
                os, 
                event, 
                path: currentPath, 
                title: item, 
                isFolder, 
                onRefresh: () => renderFiles(state.currentPath, body),
                onOpen: () => performOpenAction(currentPath, item, isFolder)
            });
            parentUl.appendChild(li);
        }
    };

    // --- Core UI and Event Handling ---

    function handleItemClick(event, { targetPath, item, isFolder }) {
        event?.stopPropagation();
        event?.preventDefault();
        performOpenAction(targetPath, item, isFolder);
    }
    
    async function performOpenAction(targetPath, item, isFolder) {
        if (isFolder) {
            const newPath = targetPath === '/' ? item : `${targetPath}/${item}`;
            await navigateTo(newPath);
        } else {
            const content = await os.db.Laynin(targetPath, item);
            os.addWindow({ title: item, content, path: targetPath, os });
        }
    }

    function showInputDialog({ title, callback }) {
        const overlay = createElement({ tag: 'div', attributes: { class: 'input-dialog-overlay' } });
        const dialog = createElement({ tag: 'div', attributes: { class: 'input-dialog' } });
        const dialogTitle = createElement({ tag: 'div', attributes: { class: 'dialog-title' }, html: title });
        const input = createElement({ tag: 'input', attributes: { type: 'text' } });
        const buttonContainer = createElement({ tag: 'div', attributes: { class: 'dialog-buttons' } });
        const okButton = createElement({ tag: 'button', html: 'OK' });
        const cancelButton = createElement({ tag: 'button', html: 'Cancel' });
        buttonContainer.append(okButton, cancelButton);
        dialog.append(dialogTitle, input, buttonContainer);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        input.focus();
        const closeDialog = () => overlay.remove();
        const submit = () => {
            if (input.value) callback(input.value);
            closeDialog();
        };
        okButton.onclick = submit;
        cancelButton.onclick = closeDialog;
        input.onkeydown = (e) => { if (e.key === 'Enter') submit(); };
    }

    // --- Navigation and Rendering ---

    async function navigateTo(newPath) {
        state.currentPath = newPath;
        updatePathBar(newPath);
        await renderFiles(newPath, body);
        await syncSidebarToPath(newPath);
    }
    
    async function renderFiles(targetPath, holder) {
        holder.innerHTML = '';
        let items = [];
        
        if (targetPath === '/') {
            const rawItems = await os.db.getAllStoreNames();
            items = rawItems.map(i => (typeof i === 'string' ? {name: i, type: 'directory'} : i));
            items = items.filter(item => item.name && !item.name.startsWith('.'));
        } else {
            items = await os.db.getAllKeys(targetPath);
        }
        
        // Sorting
        items.sort((a, b) => {
            const aName = a.name || "";
            const bName = b.name || "";
            const aIsFolder = a.type === 'directory' || aName.endsWith('.folder');
            const bIsFolder = b.type === 'directory' || bName.endsWith('.folder');

            if (aIsFolder !== bIsFolder) {
                return aIsFolder ? -1 : 1;
            }

            let valA, valB;
            switch (state.sort.by) {
                case 'date': 
                    valA = new Date(a.modified || 0).getTime();
                    valB = new Date(b.modified || 0).getTime();
                    break;
                case 'type':
                    valA = aName.split('.').pop();
                    valB = bName.split('.').pop();
                    break;
                case 'name':
                default:
                    valA = aName.toLowerCase();
                    valB = bName.toLowerCase();
            }

            if (valA < valB) return state.sort.order === 'asc' ? -1 : 1;
            if (valA > valB) return state.sort.order === 'asc' ? 1 : -1;
            return 0;
        });

        holder.className = `file-explorer-body ${state.viewMode}-view`;
        if (state.viewMode === 'details') {
            renderDetailsView(items, targetPath, holder);
        } else {
            renderIconView(items, targetPath, holder);
        }
    }

    function getIconClass(itemName, isFolder) {
        if (isFolder || itemName.endsWith('.folder') || itemName === 'desktop.folder') {
            return 'folder-icon';
        }
        if (itemName.endsWith('.js')) return 'js-icon';
        if (itemName.endsWith('.css')) return 'css-icon';
        if (itemName.endsWith('.html')) return 'html-icon';
        return 'file-icon';
    }

    function renderIconView(items, targetPath, holder) {
        if (items.length === 0) {
            holder.innerHTML = '<div class="empty-folder-state">Folder is empty</div>';
            return;
        }

        items.forEach(item => {
            const itemName = item.name;
            const isFolder = item.type === 'directory' || itemName.endsWith('.folder');
            const displayName = itemName; // Full name as requested
            const itemFullPath = targetPath === '/' ? itemName : `${targetPath}/${itemName}`;
            
            const itemDiv = createElement({
                tag: 'div',
                attributes: { 
                    class: 'file-item icon',
                    draggable: 'true',
                    'data-path': itemFullPath // Crucial for selection persistence
                },
                children: [
                    { tag: 'div', attributes: { class: getIconClass(itemName, isFolder) } },
                    { tag: 'span', html: displayName }
                ],
                on: {
                    dragstart: (e) => handleDragStart(e, itemFullPath, itemDiv.classList.contains('selected')),
                    dragover: isFolder ? handleDragOver : null,
                    dragleave: isFolder ? handleDragLeave : null,
                    drop: isFolder ? (e) => handleDrop(e, itemFullPath) : null,

                    click: (e) => {
                        e.stopPropagation();
                        if (state.selectionMode) {
                            itemDiv.classList.toggle('selected');
                            // Auto-cancel if nothing left
                            if (holder.querySelectorAll('.selected').length === 0) {
                                exitSelectionMode();
                            }
                        } else {
                            handleItemClick(e, { targetPath, item: itemName, isFolder });
                        }
                    },
                    
                    contextmenu: event => {
                         if (!state.selectionMode) {
                             holder.querySelectorAll('.file-item.selected').forEach(el => el.classList.remove('selected'));
                             itemDiv.classList.add('selected');
                         }
                         
                         showContextMenu({ 
                             os, 
                             event, 
                             path: targetPath, 
                             title: itemName, 
                             isFolder, 
                             onRefresh: () => renderFiles(state.currentPath, body),
                             onOpen: () => performOpenAction(targetPath, itemName, isFolder),
                             onEnterSelectionMode: () => {
                                 // FIX: Pass the path so it persists after re-render
                                 enterSelectionMode(itemFullPath);
                             }
                         });
                    }
                }
            });

            if (os.clipboard && os.clipboard.action === 'cut') {
                const paths = os.clipboard.paths || [os.clipboard.path];
                if (paths.includes(itemFullPath)) {
                    itemDiv.classList.add('cut-ghost');
                }
            }
            
            holder.appendChild(itemDiv);
        });
        
        holder.onclick = () => {
            if (!state.selectionMode) {
                holder.querySelectorAll('.file-item.selected').forEach(el => el.classList.remove('selected'));
            }
        };
    }

    function renderDetailsView(items, targetPath, holder) {
        holder.style.setProperty('--grid-cols', state.columnWidths.join(' '));
    
        // ... (Header creation code remains identical to previous steps) ...
        const headerCols = [{ name: 'Name', key: 'name', index: 0 }, { name: 'Date Modified', key: 'date', index: 1 }, { name: 'Type', key: 'type', index: 2 }];
        const header = createElement({ tag: 'div', attributes: { class: 'details-header' } });
        headerCols.forEach(col => {
            const cell = createElement({ tag: 'div', attributes: { class: 'header-cell' }, children: [{ tag: 'span', html: `${col.name} ${state.sort.by === col.key ? (state.sort.order === 'asc' ? '▲' : '▼') : ''}` }], on: { click: () => setSort(col.key) } });
            const resizer = createElement({ tag: 'div', attributes: { class: 'col-resizer' } });
            // ... (Resizer events identical to previous steps) ...
            const startResize = (e) => {
                e.stopPropagation(); e.preventDefault();
                const startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
                const startWidth = cell.offsetWidth;
                document.body.style.cursor = 'col-resize';
                holder.classList.add('resizing');
                const onMove = (me) => {
                    const cx = me.type.includes('touch') ? me.touches[0].clientX : me.clientX;
                    const nw = Math.max(50, startWidth + (cx - startX));
                    state.columnWidths[col.index] = `${nw}px`;
                    holder.style.setProperty('--grid-cols', state.columnWidths.join(' '));
                };
                const onStop = () => {
                    document.body.style.cursor = 'default';
                    holder.classList.remove('resizing');
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onStop);
                    document.removeEventListener('touchmove', onMove);
                    document.removeEventListener('touchend', onStop);
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onStop);
                document.addEventListener('touchmove', onMove, { passive: false });
                document.addEventListener('touchend', onStop);
            };
            resizer.addEventListener('mousedown', startResize);
            resizer.addEventListener('touchstart', startResize, { passive: false });
            resizer.addEventListener('click', e => e.stopPropagation());
            cell.appendChild(resizer);
            header.appendChild(cell);
        });
        holder.appendChild(header);
        // ... (End Header) ...
    
        if (items.length === 0) {
            holder.appendChild(createElement({ 
                tag: 'div', 
                attributes: { class: 'empty-folder-state' }, 
                html: 'Folder is empty' 
            }));
            return;
        }
    
        items.forEach(item => {
            const itemName = item.name;
            const isFolder = item.type === 'directory' || itemName.endsWith('.folder');
            const displayName = itemName;
            const itemFullPath = targetPath === '/' ? itemName : `${targetPath}/${itemName}`;
            
            let dateStr = "--";
            if(item.modified) {
                try { dateStr = new Date(item.modified).toLocaleString(); } catch(e) {}
            }
    
            const type = isFolder ? 'Folder' : (itemName.split('.').pop().toUpperCase() + ' File');
    
            const row = createElement({
                tag: 'div', 
                attributes: { 
                    class: 'details-row',
                    draggable: 'true',
                    'data-path': itemFullPath
                },
                children: [
                    { 
                        tag: 'div', 
                        attributes: { class: 'row-cell name-cell' },
                        children: [
                            { tag: 'div', attributes: { class: `small-icon ${getIconClass(itemName, isFolder)}` } },
                            { tag: 'span', html: displayName }
                        ]
                    },
                    { tag: 'div', html: dateStr, attributes: { class: 'row-cell' } },
                    { tag: 'div', html: type, attributes: { class: 'row-cell' } }
                ],
                on: { 
                    dragstart: (e) => handleDragStart(e, itemFullPath, row.classList.contains('selected')),
                    dragover: isFolder ? handleDragOver : null,
                    dragleave: isFolder ? handleDragLeave : null,
                    drop: isFolder ? (e) => handleDrop(e, itemFullPath) : null,

                    click: (e) => {
                        e.stopPropagation();
                        if (state.selectionMode) {
                            row.classList.toggle('selected');
                            if (holder.querySelectorAll('.selected').length === 0) {
                                exitSelectionMode();
                            }
                        } else {
                            handleItemClick(e, { targetPath, item: itemName, isFolder });
                        }
                    },
                    
                    contextmenu: event => {
                        if (!state.selectionMode) {
                            holder.querySelectorAll('.details-row.selected').forEach(el => el.classList.remove('selected'));
                            row.classList.add('selected');
                        }
                        showContextMenu({ 
                            os, 
                            event, 
                            path: targetPath, 
                            title: itemName, 
                            isFolder, 
                            onRefresh: () => renderFiles(state.currentPath, body),
                            onOpen: () => performOpenAction(targetPath, itemName, isFolder),
                            onEnterSelectionMode: () => {
                                 // FIX: Pass the path so it persists
                                 enterSelectionMode(itemFullPath);
                            }
                        });
                    }
                }
            });

            if (os.clipboard && os.clipboard.action === 'cut') {
                const paths = os.clipboard.paths || [os.clipboard.path];
                if (paths.includes(itemFullPath)) {
                    row.classList.add('cut-ghost');
                }
            }
            
            holder.appendChild(row);
        });
        
        holder.onclick = (e) => {
            if (!state.selectionMode && e.target === holder) {
                holder.querySelectorAll('.details-row.selected').forEach(el => el.classList.remove('selected'));
            }
        };
    }

    function setSort(key) {
        if (state.sort.by === key) {
            state.sort.order = state.sort.order === 'asc' ? 'desc' : 'asc';
        } else {
            state.sort.by = key;
            state.sort.order = 'asc';
        }
        renderFiles(state.currentPath, body);
    }

    function updatePathBar(currentPath) {
        pathBreadcrumbs.innerHTML = '';
        if (currentPath === '/') {
            pathBreadcrumbs.appendChild(createElement({ tag: 'span', attributes: { class: 'path-segment' }, html: 'Home' }));
            pathInputContainer.querySelector('input').value = 'Home';
            return;
        }

        const parts = currentPath.split('/').filter(p => p);
        parts.forEach((part, index) => {
            const cleanPart = part;
            const partPath = parts.slice(0, index + 1).join('/');
            pathBreadcrumbs.appendChild(createElement({
                tag: 'span',
                attributes: { class: 'path-segment' },
                html: cleanPart,
                on: { click: (e) => { e.stopPropagation(); navigateTo(partPath); } }
            }));
            if (index < parts.length - 1) {
                pathBreadcrumbs.appendChild(createElement({ tag: 'span', attributes: { class: 'path-separator' }, html: '›' }));
            }
        });
        pathInputContainer.querySelector('input').value = currentPath;
    }

    function createPathBar() {
        pathBreadcrumbs = createElement({ tag: 'div', attributes: { class: 'path-breadcrumbs' }});
        
        const pathInput = createElement({ tag: 'input', attributes: { type: 'text' }});
        pathInputContainer = createElement({ tag: 'div', attributes: { class: 'path-input-container' }});
        pathInputContainer.appendChild(pathInput);

        const upBtn = createElement({ 
            tag: 'button', 
            attributes: { class: 'nav-btn', title: 'Go Up' }, 
            html: '↑',
            on: { click: () => {
                if(state.currentPath === '/' || !state.currentPath) return;
                const parent = state.currentPath.split('/').slice(0, -1).join('/') || '/';
                navigateTo(parent);
            }}
        });

        const editBtn = createElement({ tag: 'button', attributes: { class: 'edit-path-btn' }, html: '✎' });

        const switchToEditMode = () => {
            pathBreadcrumbs.style.display = 'none';
            editBtn.style.display = 'none';
            pathInputContainer.style.display = 'flex';
            pathInput.focus();
            pathInput.select();
        };
        
        editBtn.onclick = switchToEditMode;

        const onEditEnd = () => {
            pathBreadcrumbs.style.display = 'flex';
            editBtn.style.display = 'block';
            pathInputContainer.style.display = 'none';
        };

        pathInput.addEventListener('blur', onEditEnd);
        pathInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                navigateTo(pathInput.value.trim());
                onEditEnd();
            }
        });
        
        const container = createElement({
            tag: 'div',
            attributes: { class: 'path-bar-container' },
            on: { click: (e) => {
                if (e.target.classList.contains('path-bar-container') || e.target.classList.contains('path-breadcrumbs')) {
                    switchToEditMode();
                }
            }}
        });

        container.append(upBtn, pathBreadcrumbs, pathInputContainer, editBtn);
        return container;
    }

    async function buildFileTree(rootPath, parentElement) {
    parentElement.innerHTML = '';
    const rootUl = createElement({ tag: 'ul' });
    parentElement.appendChild(rootUl);

    const homeLi = createElement({ tag: 'li', attributes: { 'data-full-path': '/', class: 'tree-node' }});
    const homeContent = createElement({ 
        tag: 'div', 
        attributes: { class: 'tree-node-content' },
        on: {
            dragover: handleDragOver,
            dragleave: handleDragLeave,
            drop: (e) => handleDrop(e, '/')
        }
    });
    const homeToggle = createElement({ tag: 'span', attributes: { class: 'toggle' }, html: '►' });
    const homeName = createElement({ tag: 'span', attributes: { class: 'node-name' }, html: 'Home' });
    homeContent.append(homeToggle, homeName);

    const homeChildrenUl = createElement({ tag: 'ul', attributes: { class: 'tree-children collapsed' }});

    const expandHome = async () => {
        if (homeChildrenUl.classList.contains('collapsed')) {
            homeChildrenUl.classList.remove('collapsed');
            homeToggle.innerHTML = '▼';
            await buildNode('/', homeChildrenUl); 
        }
    };

    const collapseHome = () => {
        homeChildrenUl.classList.add('collapsed');
        homeToggle.innerHTML = '►';
    };

    homeToggle.onclick = (e) => { e.stopPropagation(); homeChildrenUl.classList.contains('collapsed') ? expandHome() : collapseHome(); };
    homeContent.onclick = (e) => { e.stopPropagation(); navigateTo('/'); };
    
    homeLi.append(homeContent, homeChildrenUl);
    rootUl.appendChild(homeLi);
}


async function syncSidebarToPath(path) {
    sidebar.querySelectorAll('.tree-node-content.selected').forEach(el => el.classList.remove('selected'));

    const homeLi = sidebar.querySelector('li[data-full-path="/"]');
    if (!homeLi) return; 

    const homeContent = homeLi.querySelector('.tree-node-content');
    const homeChildrenUl = homeLi.querySelector(':scope > .tree-children');

    if (path === '/' || path === '') {
        homeContent.classList.add('selected');
        return;
    }
    
    if (homeChildrenUl.classList.contains('collapsed')) {
        const homeToggle = homeLi.querySelector(':scope > .tree-node-content > .toggle');
        homeChildrenUl.classList.remove('collapsed');
        if(homeToggle) homeToggle.innerHTML = '▼';
        await buildNode('/', homeChildrenUl); 
    }

    const parts = path.split('/').filter(Boolean);
    let parentElement = homeLi; 

    for (const part of parts) {
        let currentParentPath = parentElement.getAttribute('data-full-path');
        if (currentParentPath === '/') currentParentPath = ''; 

        let segmentToFind = `${currentParentPath}/${part}`;
        if(currentParentPath === '') segmentToFind = part; 
        
        let nodeLi = parentElement.querySelector(`:scope > ul > li[data-full-path="${segmentToFind}"]`);

        if (!nodeLi) {
            const folderSegment = `${segmentToFind}.folder`;
            nodeLi = parentElement.querySelector(`:scope > ul > li[data-full-path="${folderSegment}"]`);
        }

        if (!nodeLi) {
            return;
        }

        const childrenUl = nodeLi.querySelector(':scope > .tree-children');
        const isFolder = !!childrenUl;

        if (isFolder && childrenUl.classList.contains('collapsed')) {
            const toggle = nodeLi.querySelector(':scope > .tree-node-content > .toggle');
            childrenUl.classList.remove('collapsed');
            if (toggle) toggle.innerHTML = '▼';
            await buildNode(nodeLi.getAttribute('data-full-path'), childrenUl); 
        }
        
        parentElement = nodeLi; 
    }

    const finalNodeContent = parentElement.querySelector(':scope > .tree-node-content');
    if (finalNodeContent) {
        finalNodeContent.classList.add('selected');
        finalNodeContent.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}
    
    function createFileExplorer() {
        const container = createElement({ tag: "div", attributes: { class: "file-explorer" } });
        
        const buttonBar = createElement({ tag: 'div', attributes: { class: 'button-bar' }});
        const sidebarToggleBtn = createElement({ tag: 'button', attributes: { class: 'sidebar-toggle-btn' }, html: '<span>&#9776;</span>', on: { click: () => container.classList.toggle('sidebar-collapsed') } });
        
        const menuButtons = createElement({
            tag: 'div', attributes: { class: 'menu-buttons' },
            children: [
                { tag: "button", html: "New File", on: {
	                click: () => 
	                showInputDialog({
	                title: 'Enter New File Name', 
	                callback: async (name) => { 
		                var extO = name.lastIndexOf(".")
		                var ext = ""
		                if(extO > 0) {
			                ext = name.substring(extO)
		                }
		                var defCont = 'B"H\nContent of ' + name;
		                if(ext == ".html") {
			                defCont = 
			                "<!--B\"H-->\n"+
			                "<!DOCTYPE html>\n"+
			                "<html>\n\t<head>\n\t"+
			                "<meta charset=\"utf-8\">\n"+
			                "\t</head>\n\t" + 
			                "<body>\n\t\n\t\t\n\t\n\t" +
			                "</body>\n</html>";
		                } else if(
			                true
			                //extO == ".js"
			         ) {
			                defCont = "/*\n" + defCont + "\n*/";
		                }
		                await os.createFile({ 
		                path: state.currentPath, 
		                title: name,
		                content:defCont
	                });
	                await renderFiles(state.currentPath, body);
	         }})}},
                { tag: "button", html: "New Folder?", on: { 
                    click: () => showInputDialog({ title: 'Enter New Folder Name', callback: async (name) => { 
                        await os.createFolder({ path: state.currentPath, title: name }); 
                        
                        await buildFileTree("/", sidebar); 
                        
                        await renderFiles(state.currentPath, body); 
                        await syncSidebarToPath(state.currentPath);
                    }})
                }},
                { tag: "button", html: "Import", on: { click: () => importFiles({ os, path: state.currentPath }).then(() => renderFiles(state.currentPath, body)) }},
            ]
        });

        const viewControls = createElement({
            tag: 'div', attributes: { class: 'view-controls' },
            children: [
                { tag: 'button', html: 'Icons', on: { click: () => { state.viewMode = 'icons'; renderFiles(state.currentPath, body); } }},
                { tag: 'button', html: 'Details', on: { click: () => { state.viewMode = 'details'; renderFiles(state.currentPath, body); } }}
            ]
        });

        const spacer = createElement({tag: 'div', attributes: { style: 'flex-grow: 1' } });
        buttonBar.append(sidebarToggleBtn, menuButtons, spacer, viewControls);

        const header = createElement({ tag: "div", attributes: { class: "file-explorer-header" } });
        header.append(buttonBar, createPathBar());

        const contentArea = createElement({ tag: 'div', attributes: { class: 'file-explorer-content' }});
        sidebar = createElement({ tag: "div", attributes: { class: "file-explorer-sidebar" } });
        body = createElement({ 
            tag: "div", 
            attributes: { class: "file-explorer-body" },
            on: {
                dragover: handleDragOver,
                dragleave: handleDragLeave,
                drop: (e) => handleDrop(e, state.currentPath)
            }
        });
        const resizer = createElement({ tag: 'div', attributes: { class: 'sidebar-resizer' } });
        
        const startResize = (startEvent) => {
            startEvent.preventDefault();
            document.body.style.cursor = 'col-resize';
            const startX = startEvent.touches ? startEvent.touches[0].clientX : startEvent.clientX;
            const startWidth = sidebar.offsetWidth;
            const doDrag = (moveEvent) => {
                const currentX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
                const newWidth = startWidth + currentX - startX;
                if (newWidth > 100) sidebar.style.width = newWidth + 'px';
            };
            const stopDrag = () => {
                document.body.style.cursor = 'default';
                document.removeEventListener('mousemove', doDrag);
                document.removeEventListener('mouseup', stopDrag);
            };
            document.addEventListener('mousemove', doDrag);
            document.addEventListener('mouseup', stopDrag);
        };
        resizer.addEventListener('mousedown', startResize);

        contentArea.append(sidebar, resizer, body);
        container.append(header, contentArea);

        buildFileTree("/", sidebar);
        navigateTo(state.currentPath);
        
        body.addEventListener('contextmenu', event => {
	    if (event.target === body || event.target.classList.contains('empty-folder-state')) {
	        const menuItems = new Map([
	            ['Toggle Full Screen', () => os.toggleFullScreen()]
	        ]);
	        
	        showGenericContextMenu({ 
                event, 
                menuItems,
                os,
                currentPath: state.currentPath,
                onRefresh: () => renderFiles(state.currentPath, body)
            });
	    }
	});
        return container;
    }

    var self = { div: createFileExplorer() };
    const style = document.createElement("style");
    style.innerHTML = myStyles;
    document.head.appendChild(style);
    return self;
};