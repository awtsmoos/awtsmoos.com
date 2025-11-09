/*B"H*/
import {
    createElement
} from "/scripts/awtsmoos/ui/basic.js"
import myStyles from "./styles.js";
import {
    importFiles
} from  "/os/helpers/scripts.js"

export default ({
    os,
    path,
    title,
    system
} = {}) => {
    
    // --- State and Variables ---
    const state = {
        currentPath: path + "/" + title,
        viewMode: 'icons',
        sort: { by: 'name', order: 'asc' },
    };

    let body, sidebar, pathBreadcrumbs, pathInputContainer, clickTimeout = null, clickCount = 0;

    // --- Core UI and Event Handling ---

    /**
     * Handles single and double clicks for context menus and opening files/folders.
     */
    function handleItemClick(event, { targetPath, item, isFolder, actions = {} }) {
        event.stopPropagation();
        clickCount++;

        if (clickCount === 1) {
            clickTimeout = setTimeout(() => {
                // Single Click: Show Context Menu
                showContextMenu(event, { targetPath, item, isFolder, actions });
                clickCount = 0;
            }, 300); // 300ms window for double click
        } else if (clickCount === 2) {
            // Double Click: Open Item
            clearTimeout(clickTimeout);
            clickCount = 0;
            performOpenAction(targetPath, item, isFolder);
        }
    }
    
    async function performOpenAction(targetPath, item, isFolder) {
        if (isFolder) {
            await navigateTo(`${targetPath}/${item}`);
        } else {
            const content = await os.db.Laynin(targetPath, item);
            os.addWindow({ title: item, content, path: targetPath, os });
        }
    }

    function showContextMenu(event, { targetPath, item, isFolder, actions }) {
        // Remove any existing menu
        const existingMenu = document.querySelector(".contextMenu");
        if (existingMenu) existingMenu.remove();

        const menuActions = {
            Open: () => performOpenAction(targetPath, item, isFolder),
            ...actions, // Add specific actions like Expand/Collapse
            Rename: async () => { /* ... rename logic ... */ },
            Delete: async () => { /* ... delete logic ... */ },
        };
        
        const menu = createElement({ tag: 'div', attributes: { class: 'contextMenu' }});
        
        Object.keys(menuActions).forEach(actionName => {
            const menuItem = createElement({
                tag: 'div',
                attributes: { class: 'menuItem' },
                html: actionName,
                on: { click: (e) => {
                    e.stopPropagation();
                    menu.remove();
                    menuActions[actionName]();
                }}
            });
            menu.appendChild(menuItem);
        });

        menu.style.left = `${event.pageX}px`;
        menu.style.top = `${event.pageY}px`;
        document.body.appendChild(menu);

        // Remove menu when clicking elsewhere
        const clickOutsideHandler = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', clickOutsideHandler);
            }
        };
        setTimeout(() => document.addEventListener('click', clickOutsideHandler), 0);
    }

    // --- Navigation and Rendering ---

    async function navigateTo(newPath) {
        state.currentPath = newPath;
        updatePathBar(newPath);
        await renderFiles(newPath, body);
    }

    async function renderFiles(targetPath, holder) {
        holder.innerHTML = '';
        let items = await os.db.getAllKeys(targetPath);
        
        items.sort((a, b) => {
            const isAFolder = a.endsWith('.folder');
            const isBFolder = b.endsWith('.folder');
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
        if (itemName.endsWith('.folder')) return 'folder-icon';
        if (itemName.endsWith('.js')) return 'js-icon';
        if (itemName.endsWith('.css')) return 'css-icon';
        if (itemName.endsWith('.html')) return 'html-icon';
        return 'file-icon'; // Default
    }

    function renderIconView(items, targetPath, holder) {
        items.forEach(item => {
            const isFolder = item.endsWith('.folder');
            const fileItem = createElement({
                tag: 'div',
                attributes: { class: 'file-item icon' },
                children: [
                    { tag: 'div', attributes: { class: getIconClass(item) } },
                    { tag: 'span', html: item.replace('.folder', '') }
                ],
                on: { click: (e) => handleItemClick(e, { targetPath, item, isFolder }) }
            });
            holder.appendChild(fileItem);
        });
    }

    function renderDetailsView(items, targetPath, holder) {
        const header = createElement({ /* ... header ... */ });
        holder.appendChild(header);

        items.forEach(item => {
            const isFolder = item.endsWith('.folder');
            const row = createElement({
                /* ... details row structure ... */
                on: { click: (e) => handleItemClick(e, { targetPath, item, isFolder }) }
            });
            holder.appendChild(row);
        });
    }

    // --- UI Component Creation ---

    function updatePathBar(currentPath) {
        pathBreadcrumbs.innerHTML = '';
        const parts = currentPath.split('/').filter(p => p);
        parts.forEach((part, index) => {
            const partPath = parts.slice(0, index + 1).join('/');
            pathBreadcrumbs.appendChild(createElement({
                tag: 'span',
                attributes: { class: 'path-segment' },
                html: part.replace('.folder', ''),
                on: { click: () => navigateTo(partPath) }
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

        const editBtn = createElement({
            tag: 'button',
            attributes: { class: 'edit-path-btn' },
            html: '✎',
            on: { click: () => {
                pathBreadcrumbs.style.display = 'none';
                editBtn.style.display = 'none';
                pathInputContainer.style.display = 'flex';
                pathInput.focus();
                pathInput.select();
            }}
        });

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

        const container = createElement({ tag: 'div', attributes: { class: 'path-bar-container' }});
        container.append(pathBreadcrumbs, pathInputContainer, editBtn);
        return container;
    }

    async function buildFileTree(rootPath, parentElement) {
        parentElement.innerHTML = '';
        const rootUl = createElement({ tag: 'ul' });
        parentElement.appendChild(rootUl);

        const buildNode = async (currentPath, parentUl) => {
            let items = await os.db.getAllKeys(currentPath);
            items.sort((a, b) => { /* ... sort logic ... */ });

            for (const item of items) {
                const isFolder = item.endsWith('.folder');
                const fullPath = `${currentPath}/${item}`;
                const li = createElement({ tag: 'li', attributes: { class: 'tree-node' } });
                const contentWrapper = createElement({ tag: 'div', attributes: { class: 'tree-node-content' }});
                
                const nameSpan = createElement({ tag: 'span', attributes: { class: 'node-name' }, html: item.replace('.folder', '')});
                
                let toggle;
                if (isFolder) {
                    toggle = createElement({ tag: 'span', attributes: { class: 'toggle' }, html: '►' });
                    contentWrapper.append(toggle, nameSpan);
                } else {
                    contentWrapper.append(createElement({ tag: 'span', attributes: { class: 'toggle' } }), nameSpan); // placeholder
                }
                
                const childrenUl = isFolder ? createElement({ tag: 'ul', attributes: { class: 'tree-children collapsed' } }) : null;

                const toggleExpansion = (e) => {
                    e?.stopPropagation();
                    const isCollapsed = childrenUl.classList.contains('collapsed');
                    if (isCollapsed) {
                        childrenUl.classList.remove('collapsed');
                        toggle.innerHTML = '▼';
                        if (!childrenUl.hasChildNodes()) buildNode(fullPath, childrenUl);
                    } else {
                        childrenUl.classList.add('collapsed');
                        toggle.innerHTML = '►';
                    }
                };

                contentWrapper.onclick = (e) => handleItemClick(e, {
                    targetPath: currentPath,
                    item,
                    isFolder,
                    actions: isFolder ? { 'Expand/Collapse': toggleExpansion } : {}
                });

                li.append(contentWrapper);
                if (childrenUl) li.appendChild(childrenUl);
                if (toggle) toggle.onclick = toggleExpansion;

                parentUl.appendChild(li);
            }
        };
        await buildNode(rootPath, rootUl);
    }
    
    function createFileExplorer() {
        const container = createElement({ tag: "div", attributes: { class: "file-explorer" } });
        
        // --- Header Construction ---
        const buttonBar = createElement({ tag: 'div', attributes: { class: 'button-bar' }});
        const sidebarToggleBtn = createElement({ /* ... button ... */ });
        const menuButtons = createElement({ /* ... buttons ... */ });
        const viewControls = createElement({ /* ... buttons ... */ });
        buttonBar.append(sidebarToggleBtn, menuButtons, viewControls);

        const header = createElement({ tag: "div", attributes: { class: "file-explorer-header" } });
        header.append(buttonBar, createPathBar());

        // --- Content Area Construction ---
        const contentArea = createElement({ tag: 'div', attributes: { class: 'file-explorer-content' }});
        sidebar = createElement({ tag: "div", attributes: { class: "file-explorer-sidebar" } });
        body = createElement({ tag: "div", attributes: { class: "file-explorer-body" } });
        
        const resizer = createElement({ tag: 'div', attributes: { class: 'sidebar-resizer' } });
        
        // Add Mouse and Touch resizing
        const startResize = (startEvent) => {
            startEvent.preventDefault();
            document.body.style.cursor = 'col-resize';
            const startX = startEvent.touches ? startEvent.touches[0].clientX : startEvent.clientX;
            const startWidth = sidebar.offsetWidth;

            const doDrag = (moveEvent) => {
                const currentX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
                const newWidth = startWidth + currentX - startX;
                if (newWidth > 50) sidebar.style.width = newWidth + 'px';
            };
            const stopDrag = () => {
                document.body.style.cursor = 'default';
                document.removeEventListener('mousemove', doDrag);
                document.removeEventListener('touchmove', doDrag);
                document.removeEventListener('mouseup', stopDrag);
                document.removeEventListener('touchend', stopDrag);
            };

            document.addEventListener('mousemove', doDrag);
            document.addEventListener('touchmove', doDrag, { passive: false });
            document.addEventListener('mouseup', stopDrag);
            document.addEventListener('touchend', stopDrag);
        };
        resizer.addEventListener('mousedown', startResize);
        resizer.addEventListener('touchstart', startResize, { passive: false });

        contentArea.append(sidebar, resizer, body);
        container.append(header, contentArea);

        buildFileTree('desktop.folder', sidebar);
        navigateTo(state.currentPath);
        
        return container;
    }

    var self = { div: createFileExplorer() };
    const style = document.createElement("style");
    style.innerHTML = myStyles;
    document.head.appendChild(style);
    return self;
};