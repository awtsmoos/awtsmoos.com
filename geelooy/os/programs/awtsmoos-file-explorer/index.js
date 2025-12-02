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
    currentPath: path || '/',
    viewMode: 'icons',
    sort: { by: 'name', order: 'asc' },
    // Default widths for Name, Date, Type
    columnWidths: ['2fr', '1fr', '1fr'] 
};

    let body, sidebar, pathBreadcrumbs, pathInputContainer;
    let buildNode;

    // This is the recursive function that draws the sidebar tree.
   
    buildNode = async (currentPath, parentUl) => {
        parentUl.innerHTML = ''; 
        let items = [];

        if (currentPath === '/') {
            const rawItems = await os.db.getAllStoreNames();
            // FIX: Handle if response is already objects, or map strings if legacy
            items = rawItems.map(n => {
                if(typeof n === 'object' && n !== null) return n;
                return { name: n, type: 'directory' };
            });
            // FIX: Ensure name exists before checking startsWith
            items = items.filter(i => i.name && !i.name.startsWith('.'));
        } else {
            try {
                items = await os.db.getAllKeys(currentPath);
            } catch (e) { return; }
        }
        
        // Sort for Tree: Folders first, then names
        items.sort((a, b) => {
            const aName = a.name || "";
            const bName = b.name || "";
            // Logic: It is a folder if type is directory OR name ends in .folder OR we are at root
            const aIsFolder = a.type === 'directory' || aName.endsWith('.folder') || currentPath === '/';
            const bIsFolder = b.type === 'directory' || bName.endsWith('.folder') || currentPath === '/';
            
            if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;
            return aName.localeCompare(bName);
        });

        for (const itemObj of items) {
            const item = itemObj.name;
            const isFolder = itemObj.type === 'directory' || item.endsWith('.folder') || currentPath === '/';
            const fullPath = currentPath === '/' ? item : `${currentPath}/${item}`;
            const displayName = item.replace('.folder', '');

            const li = createElement({ tag: 'li', attributes: { 'data-full-path': fullPath, class: 'tree-node' }});
            const contentWrapper = createElement({ tag: 'div', attributes: { class: 'tree-node-content' }});
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
            
            contentWrapper.oncontextmenu = event => showContextMenu({ os, event, path: currentPath, title: item, isFolder });
            parentUl.appendChild(li);
        }
    };

    // --- Core UI and Event Handling ---

    function handleItemClick(event, { targetPath, item, isFolder }) {
        event.stopPropagation();
        event.preventDefault();
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
    
    // In awtsmoos-file-explorer/index.js

    // REPLACEMENT for renderFiles
    async function renderFiles(targetPath, holder) {
        holder.innerHTML = '';
        let items = [];
        
        if (targetPath === '/') {
            items = await os.db.getAllStoreNames();
            // Root might still return strings depending on implementation, 
            // convert to objects if needed for consistency
            items = items.map(i => typeof i === 'string' ? {name: i, type: 'directory'} : i);
            items = items.filter(item => !item.name.startsWith('.'));
        } else {
            items = await os.db.getAllKeys(targetPath);
        }
        
        // Sorting Logic
        items.sort((a, b) => {
            const aName = a.name;
            const bName = b.name;
            const aIsFolder = a.type === 'directory' || aName.endsWith('.folder');
            const bIsFolder = b.type === 'directory' || bName.endsWith('.folder');

            // 1. Always Group Folders First
            if (aIsFolder !== bIsFolder) {
                return aIsFolder ? -1 : 1;
            }

            // 2. Sort based on selected criterion
            let valA, valB;
            
            switch (state.sort.by) {
                case 'date': // Modified date
                    valA = new Date(a.modified || 0).getTime();
                    valB = new Date(b.modified || 0).getTime();
                    break;
                case 'type':
                    // If both are files, sort by extension
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
	        // Check new API type OR legacy suffix
	        const isFolder = item.type === 'directory' || itemName.endsWith('.folder');
	        const displayName = itemName.replace('.folder', '');
	        
	        const itemDiv = createElement({
	            tag: 'div',
	            attributes: { class: 'file-item icon' },
	            children: [
	                { tag: 'div', attributes: { class: getIconClass(itemName, isFolder) } },
	                { tag: 'span', html: displayName }
	            ],
	            on: {
	                // SINGLE CLICK: Select
	                click: (e) => {
	                    e.stopPropagation();
	                    // 1. Remove 'selected' from all other items
	                    holder.querySelectorAll('.file-item.selected').forEach(el => el.classList.remove('selected'));
	                    // 2. Add 'selected' to this item
	                    itemDiv.classList.add('selected');
	                },
	                
	                // DOUBLE CLICK: Open
	                dblclick: (e) => {
	                    e.stopPropagation();
	                    handleItemClick(e, { targetPath, item: itemName, isFolder });
	                },
	                
	                // RIGHT CLICK: Select + Context Menu
	                contextmenu: event => {
	                     // Select this item on right click too
	                     holder.querySelectorAll('.file-item.selected').forEach(el => el.classList.remove('selected'));
	                     itemDiv.classList.add('selected');
	                     
	                     showContextMenu({ os, event, path: targetPath, title: itemName, isFolder });
	                }
	            }
	        });
	        
	        holder.appendChild(itemDiv);
	    });
	    
	    // Clicking on white space deselects everything
	    holder.onclick = () => {
	        holder.querySelectorAll('.file-item.selected').forEach(el => el.classList.remove('selected'));
	    };
	}


    function renderDetailsView(items, targetPath, holder) {
	    // Apply the current column widths to the CSS variable
	    holder.style.setProperty('--grid-cols', state.columnWidths.join(' '));
	
	    // -- HEADER CREATION --
	    const headerCols = [
	        { name: 'Name', key: 'name', index: 0 },
	        { name: 'Date Modified', key: 'date', index: 1 },
	        { name: 'Type', key: 'type', index: 2 }
	    ];
	
	    const header = createElement({ tag: 'div', attributes: { class: 'details-header' } });
	
	    headerCols.forEach(col => {
	        const cell = createElement({
	            tag: 'div',
	            attributes: { class: 'header-cell' },
	            children: [
	                { tag: 'span', html: `${col.name} ${state.sort.by === col.key ? (state.sort.order === 'asc' ? '▲' : '▼') : ''}` }
	            ],
	            on: { click: () => setSort(col.key) }
	        });
	
	        // Add Resizer Handle
	        const resizer = createElement({ tag: 'div', attributes: { class: 'col-resizer' } });
	        
	        const startResize = (e) => {
	            e.stopPropagation(); // Don't sort when resizing
	            e.preventDefault();
	            
	            const startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
	            const startWidth = cell.offsetWidth;
	            
	            document.body.style.cursor = 'col-resize';
	            holder.classList.add('resizing'); // Prevents hover effects while resizing
	
	            const onMove = (moveEvent) => {
	                const currentX = moveEvent.type.includes('touch') ? moveEvent.touches[0].clientX : moveEvent.clientX;
	                const diff = currentX - startX;
	                const newWidth = Math.max(50, startWidth + diff); // Min width 50px
	                
	                // Update State
	                state.columnWidths[col.index] = `${newWidth}px`;
	                // Update DOM instantly via CSS var
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
	        resizer.addEventListener('click', e => e.stopPropagation()); // Prevent sort click
	
	        cell.appendChild(resizer);
	        header.appendChild(cell);
	    });
	
	    holder.appendChild(header);
	
	    // -- ROWS CREATION --
	    items.forEach(item => {
	        const itemName = item.name;
	        const isFolder = item.type === 'directory' || itemName.endsWith('.folder');
	        const displayName = itemName.replace('.folder', '');
	        
	        let dateStr = "--";
	        if(item.modified) {
	            try { dateStr = new Date(item.modified).toLocaleString(); } catch(e) {}
	        }
	
	        const type = isFolder ? 'Folder' : (itemName.split('.').pop().toUpperCase() + ' File');
	
	        const row = createElement({
	            tag: 'div', attributes: { class: 'details-row' },
	            children: [
	                { tag: 'div', html: displayName, attributes: { class: 'row-cell name-cell' } },
	                { tag: 'div', html: dateStr, attributes: { class: 'row-cell' } },
	                { tag: 'div', html: type, attributes: { class: 'row-cell' } }
	            ],
	            on: { click: (e) => handleItemClick(e, { targetPath, item: itemName, isFolder }) }
	        });
	        
	        row.oncontextmenu = event => showContextMenu({ os, event, path: targetPath, title: itemName, isFolder });
	        holder.appendChild(row);
	    });
	}

    // Helper to toggle sort (add this to the file scope)
    function setSort(key) {
        if (state.sort.by === key) {
            state.sort.order = state.sort.order === 'asc' ? 'desc' : 'asc';
        } else {
            state.sort.by = key;
            state.sort.order = 'asc';
        }
        renderFiles(state.currentPath, body);
    }

    // --- UI Component Creation ---

    function updatePathBar(currentPath) {
        pathBreadcrumbs.innerHTML = '';
        if (currentPath === '/') {
            pathBreadcrumbs.appendChild(createElement({ tag: 'span', attributes: { class: 'path-segment' }, html: 'Home' }));
            pathInputContainer.querySelector('input').value = 'Home';
            return;
        }

        const parts = currentPath.split('/').filter(p => p);
        parts.forEach((part, index) => {
            const cleanPart = part.replace('.folder', '');
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
        pathInputContainer.querySelector('input').value = currentPath.replace(/\.folder/g, '');
    }

    function createPathBar() {
	    pathBreadcrumbs = createElement({ tag: 'div', attributes: { class: 'path-breadcrumbs' }});
	    
	    const pathInput = createElement({ tag: 'input', attributes: { type: 'text' }});
	    pathInputContainer = createElement({ tag: 'div', attributes: { class: 'path-input-container' }});
	    pathInputContainer.appendChild(pathInput);
	
	    // --- UP BUTTON ---
	    const upBtn = createElement({ 
	        tag: 'button', 
	        attributes: { class: 'nav-btn', title: 'Go Up' }, 
	        html: '↑',
	        on: { click: () => {
	            if(state.currentPath === '/' || !state.currentPath) return;
	            // Remove last segment to go up
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
	
	    // Add Up button to the start
	    container.append(upBtn, pathBreadcrumbs, pathInputContainer, editBtn);
	    return container;
	}

    async function buildFileTree(rootPath, parentElement) {
    parentElement.innerHTML = '';
    const rootUl = createElement({ tag: 'ul' });
    parentElement.appendChild(rootUl);

    // Manually create the "Home" root node, which is always present
    const homeLi = createElement({ tag: 'li', attributes: { 'data-full-path': '/', class: 'tree-node' }});
    const homeContent = createElement({ tag: 'div', attributes: { class: 'tree-node-content' }});
    const homeToggle = createElement({ tag: 'span', attributes: { class: 'toggle' }, html: '►' });
    const homeName = createElement({ tag: 'span', attributes: { class: 'node-name' }, html: 'Home' });
    homeContent.append(homeToggle, homeName);

    const homeChildrenUl = createElement({ tag: 'ul', attributes: { class: 'tree-children collapsed' }});

    const expandHome = async () => {
        if (homeChildrenUl.classList.contains('collapsed')) {
            homeChildrenUl.classList.remove('collapsed');
            homeToggle.innerHTML = '▼';
            // Load the contents of "Home" (i.e., the root stores) only when expanded
            await buildNode('/', homeChildrenUl); 
        }
    };

    const collapseHome = () => {
        homeChildrenUl.classList.add('collapsed');
        homeToggle.innerHTML = '►';
    };

    // Assign click events
    homeToggle.onclick = (e) => { e.stopPropagation(); homeChildrenUl.classList.contains('collapsed') ? expandHome() : collapseHome(); };
    homeContent.onclick = (e) => { e.stopPropagation(); navigateTo('/'); };
    
    homeLi.append(homeContent, homeChildrenUl);
    rootUl.appendChild(homeLi);
}


async function syncSidebarToPath(path) {
    // Clear any previous selection
    sidebar.querySelectorAll('.tree-node-content.selected').forEach(el => el.classList.remove('selected'));

    const homeLi = sidebar.querySelector('li[data-full-path="/"]');
    if (!homeLi) return; // Silent return if tree isn't built yet

    const homeContent = homeLi.querySelector('.tree-node-content');
    const homeChildrenUl = homeLi.querySelector(':scope > .tree-children');

    // If path is root, just select Home.
    if (path === '/' || path === '') {
        homeContent.classList.add('selected');
        return;
    }
    
    // Ensure Home is expanded
    if (homeChildrenUl.classList.contains('collapsed')) {
        const homeToggle = homeLi.querySelector(':scope > .tree-node-content > .toggle');
        homeChildrenUl.classList.remove('collapsed');
        if(homeToggle) homeToggle.innerHTML = '▼';
        await buildNode('/', homeChildrenUl); 
    }

    // Split path and filter out empty strings
    const parts = path.split('/').filter(Boolean);
    let parentElement = homeLi; 

    for (const part of parts) {
        let currentParentPath = parentElement.getAttribute('data-full-path');
        if (currentParentPath === '/') currentParentPath = ''; // normalization

        // 1. Try exact match (e.g., "desktop")
        let segmentToFind = `${currentParentPath}/${part}`;
        if(currentParentPath === '') segmentToFind = part; // Handle first level
        
        let nodeLi = parentElement.querySelector(`:scope > ul > li[data-full-path="${segmentToFind}"]`);

        // 2. If not found, try adding ".folder" (e.g., "desktop.folder")
        if (!nodeLi) {
            const folderSegment = `${segmentToFind}.folder`;
            nodeLi = parentElement.querySelector(`:scope > ul > li[data-full-path="${folderSegment}"]`);
        }

        if (!nodeLi) {
            // Path might not exist in sidebar (it might be a file, or not loaded yet).
            // We stop syncing silently instead of throwing an error.
            return;
        }

        const childrenUl = nodeLi.querySelector(':scope > .tree-children');
        const isFolder = !!childrenUl;

        // Expand if it's a folder and we are not at the final node yet
        if (isFolder && childrenUl.classList.contains('collapsed')) {
            const toggle = nodeLi.querySelector(':scope > .tree-node-content > .toggle');
            childrenUl.classList.remove('collapsed');
            if (toggle) toggle.innerHTML = '▼';
            await buildNode(nodeLi.getAttribute('data-full-path'), childrenUl); 
        }
        
        parentElement = nodeLi; 
    }

    // Select the final node found
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
                        
                        // THE FIX IS HERE: The call to rebuild the tree is now correct.
                        await buildFileTree("/", sidebar); 
                        
                        await renderFiles(state.currentPath, body); 
                        // After rebuilding, re-sync to the current path.
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
        body = createElement({ tag: "div", attributes: { class: "file-explorer-body" } });
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

        // --- THE CORRECT INITIALIZATION LOGIC ---
        // 1. ALWAYS build the sidebar from the true root ("/").
        buildFileTree("/", sidebar);
        
        // 2. THEN, navigate to the starting folder.
        navigateTo(state.currentPath);
        body.addEventListener('contextmenu', event => {
	    // Ensure the click is on the background, not a file item
	    if (event.target === body) {
	        const menuItems = new Map([
	            ['Toggle Full Screen', () => os.toggleFullScreen()]
	            // Future items for the explorer background can go here
	        ]);
	        showGenericContextMenu({ event, menuItems });
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