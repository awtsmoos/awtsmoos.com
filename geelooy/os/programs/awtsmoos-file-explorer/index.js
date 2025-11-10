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
};

    let body, sidebar, pathBreadcrumbs, pathInputContainer;
    let buildNode;

    // This is the recursive function that draws the sidebar tree.
    buildNode = async (currentPath, parentUl) => {
        parentUl.innerHTML = ''; 
        let items = [];

        // It correctly asks the database for the root items or a folder's contents.
        if (currentPath === '/') {
            items = await os.db.getAllStoreNames();
            items = items.filter(item => !item.startsWith('.'));
        } else {
            try {
                items = await os.db.getAllKeys(currentPath);
            } catch (e) { return; }
        }
        
        items.sort((a, b) => {
            const isAFolder = a.endsWith('.folder') || currentPath === '/';
            const isBFolder = b.endsWith('.folder') || currentPath === '/';
            if (isAFolder !== isBFolder) return isAFolder ? -1 : 1;
            return a.localeCompare(b);
        });

        for (const item of items) {
            const isFolder = currentPath === '/' || item.endsWith('.folder');
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
    
    async function renderFiles(targetPath, holder) {
        holder.innerHTML = '';
        let items = [];
        
        if (targetPath === '/') {
            items = await os.db.getAllStoreNames();
            items = items.filter(item => !item.startsWith('.'));
        } else {
            items = await os.db.getAllKeys(targetPath);
        }
        
        items.sort((a, b) => {
            const isAFolder = a.endsWith('.folder') || targetPath === '/';
            const isBFolder = b.endsWith('.folder') || targetPath === '/';
            if (isAFolder !== isBFolder) return isAFolder ? -1 : 1;
            return state.sort.order === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
        });

        holder.className = `file-explorer-body ${state.viewMode}-view`;
        if (state.viewMode === 'details') {
            renderDetailsView(items, targetPath, holder);
        } else {
            renderIconView(items, targetPath, holder);
        }
    }

    function getIconClass(itemName) {
        if (itemName.endsWith('.folder') || itemName === 'desktop.folder') return 'folder-icon';
        if (itemName.endsWith('.js')) return 'js-icon';
        if (itemName.endsWith('.css')) return 'css-icon';
        if (itemName.endsWith('.html')) return 'html-icon';
        return 'file-icon';
    }

    function renderIconView(items, targetPath, holder) {
        items.forEach(item => {
            const isFolder = item.endsWith('.folder') || targetPath === '/';
            holder.appendChild(createElement({
                tag: 'div',
                attributes: { class: 'file-item icon' },
                children: [
                    { tag: 'div', attributes: { class: getIconClass(item) } },
                    { tag: 'span', html: item.replace('.folder', '') }
                ],
                on: {
	                click: (e) => handleItemClick(e, { targetPath, item, isFolder }),
	                contextmenu: event => showContextMenu({ os, event, path: targetPath, title: item, isFolder })
                }
            }));
        });
    }

    function renderDetailsView(items, targetPath, holder) {
        const header = createElement({
            tag: 'div', attributes: { class: 'details-header' },
            children: [
                { tag: 'div', html: 'Name ▼', on: { click: () => setSort('name') } },
                { tag: 'div', html: 'Date Modified' },
                { tag: 'div', html: 'Type' }
            ]
        });
        holder.appendChild(header);

        items.forEach(item => {
            const isFolder = item.endsWith('.folder') || targetPath === '/';
            const displayName = item.replace('.folder', '');
            const type = isFolder ? 'Folder' : (item.split('.').pop() || 'File');

            const row = createElement({
                tag: 'div', attributes: { class: 'details-row' },
                children: [
                    { tag: 'div', html: displayName },
                    { tag: 'div', html: '11/8/2025' },
                    { tag: 'div', html: type }
                ],
                on: { click: (e) => handleItemClick(e, { targetPath, item, isFolder }) }
            });
            holder.appendChild(row);
        });
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

        container.append(pathBreadcrumbs, pathInputContainer, editBtn);
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


// NEW FUNCTION 2: syncSidebarToPath
// This new version starts from the "Home" node and recursively expands and loads
// each part of the path until it finds the final destination.
async function syncSidebarToPath(path) {
    // Clear any previous selection
    sidebar.querySelectorAll('.tree-node-content.selected').forEach(el => el.classList.remove('selected'));

    const homeLi = sidebar.querySelector('li[data-full-path="/"]');
    if (!homeLi) {
        console.error("Sidebar sync failed: Root 'Home' node not found.");
        return;
    }

    const homeContent = homeLi.querySelector('.tree-node-content');
    const homeChildrenUl = homeLi.querySelector(':scope > .tree-children');

    // If path is root, just select Home and we're done.
    if (path === '/') {
        homeContent.classList.add('selected');
        return;
    }
    
    // --- Core Expansion Logic ---
    // First, ensure the "Home" node itself is expanded and its children are loaded
    if (homeChildrenUl.classList.contains('collapsed')) {
        const homeToggle = homeLi.querySelector(':scope > .tree-node-content > .toggle');
        homeChildrenUl.classList.remove('collapsed');
        if(homeToggle) homeToggle.innerHTML = '▼';
        await buildNode('/', homeChildrenUl); // Await loading of root items
    }

    const parts = path.split('/');
    let parentElement = homeLi; // Start the search from within the expanded "Home" li

    for (const part of parts) {
        const currentPathSegment = parentElement.getAttribute('data-full-path') === '/' 
            ? part 
            : `${parentElement.getAttribute('data-full-path')}/${part}`;

        // Find the direct child LI for the next path segment
        const nodeLi = parentElement.querySelector(`:scope > ul > li[data-full-path="${currentPathSegment}"]`);

        if (!nodeLi) {
            console.error(`Sidebar sync failed: Could not find node for path segment "${currentPathSegment}"`);
            return;
        }

        const childrenUl = nodeLi.querySelector(':scope > .tree-children');
        const isFolder = !!childrenUl;

        if (isFolder && childrenUl.classList.contains('collapsed')) {
            const toggle = nodeLi.querySelector(':scope > .tree-node-content > .toggle');
            childrenUl.classList.remove('collapsed');
            if (toggle) toggle.innerHTML = '▼';
            await buildNode(currentPathSegment, childrenUl); // Await loading of this level
        }
        
        parentElement = nodeLi; // The current node is now the parent for the next loop
    }

    // After the loop, the final `parentElement` is the target node. Select it.
    const finalNodeContent = parentElement.querySelector(':scope > .tree-node-content');
    if (finalNodeContent) {
        finalNodeContent.classList.add('selected');
    }
}
    
    function createFileExplorer() {
        const container = createElement({ tag: "div", attributes: { class: "file-explorer" } });
        
        const buttonBar = createElement({ tag: 'div', attributes: { class: 'button-bar' }});
        const sidebarToggleBtn = createElement({ tag: 'button', attributes: { class: 'sidebar-toggle-btn' }, html: '<span>&#9776;</span>', on: { click: () => container.classList.toggle('sidebar-collapsed') } });
        
        const menuButtons = createElement({
            tag: 'div', attributes: { class: 'menu-buttons' },
            children: [
                { tag: "button", html: "New File", on: { click: () => showInputDialog({ title: 'Enter New File Name', callback: async (name) => { await os.createFile({ path: state.currentPath, title: name }); await renderFiles(state.currentPath, body); }})}},
                { tag: "button", html: "New Folder", on: { 
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