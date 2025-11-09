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
    
    // State for the file explorer instance
    const state = {
        currentPath: path + "/" + title,
        viewMode: 'icons', // 'icons' or 'details'
        sort: { by: 'name', order: 'asc' },
    };

    let body, sidebar, pathInput, pathBarDisplay;

    // --- Core Navigation and Rendering ---
    async function navigateTo(newPath) {
        state.currentPath = newPath;
        updatePathBar(newPath);
        await renderFiles(newPath, body);
    }

    async function renderFiles(targetPath, holder) {
        holder.innerHTML = ''; // Clear previous content
        let items = await os.db.getAllKeys(targetPath);
        
        // Sorting logic
        items.sort((a, b) => {
            const isAFolder = a.endsWith('.folder');
            const isBFolder = b.endsWith('.folder');
            
            if (isAFolder && !isBFolder) return -1;
            if (!isAFolder && isBFolder) return 1;

            const nameA = a.replace('.folder', '');
            const nameB = b.replace('.folder', '');

            if (state.sort.order === 'asc') {
                return nameA.localeCompare(nameB);
            } else {
                return nameB.localeCompare(nameA);
            }
        });

        if (state.viewMode === 'details') {
            renderDetailsView(items, targetPath, holder);
        } else {
            renderIconView(items, targetPath, holder);
        }
    }

    // --- View Modes ---
    function renderIconView(items, targetPath, holder) {
        holder.className = "file-explorer-body icon-view";
        items.forEach(item => {
            const isFolder = item.endsWith('.folder');
            const displayName = item.replace('.folder', '');
            
            const fileItem = createElement({
                tag: 'div',
                attributes: { class: 'file-item icon' },
                children: [
                    { tag: 'div', attributes: { class: isFolder ? 'folder-icon' : 'file-icon' } },
                    { tag: 'span', html: displayName }
                ],
                on: {
                    click: async (e) => {
                        e.stopPropagation();
                        if (isFolder) {
                            await navigateTo(`${targetPath}/${item}`);
                        } else {
                            const content = await os.db.Laynin(targetPath, item);
                            os.addWindow({ title: item, content, path: targetPath, os });
                        }
                    }
                }
            });
            holder.appendChild(fileItem);
        });
    }

    function renderDetailsView(items, targetPath, holder) {
        holder.className = "file-explorer-body details-view";
        
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
            const isFolder = item.endsWith('.folder');
            const displayName = item.replace('.folder', '');
            const type = isFolder ? 'Folder' : (item.split('.').pop() || 'File');

            const row = createElement({
                tag: 'div', attributes: { class: 'details-row' },
                children: [
                    { tag: 'div', html: displayName },
                    { tag: 'div', html: '11/7/2025' }, // Placeholder for date modified
                    { tag: 'div', html: type }
                ],
                on: {
                    click: async (e) => {
                        e.stopPropagation();
                        if (isFolder) {
                            await navigateTo(`${targetPath}/${item}`);
                        } else {
                            const content = await os.db.Laynin(targetPath, item);
                            os.addWindow({ title: item, content, path: targetPath, os });
                        }
                    }
                }
            });
            holder.appendChild(row);
        });
    }

    // --- UI Components ---
    function updatePathBar(currentPath) {
        pathBarDisplay.innerHTML = '';
        
        let builtPath = '';
        const parts = currentPath.split('/').filter(p => p);

        parts.forEach((part, index) => {
            const partPath = parts.slice(0, index + 1).join('/');
            const partEl = createElement({
                tag: 'span',
                attributes: { class: 'path-segment' },
                html: part.replace('.folder', ''),
                on: { click: () => navigateTo(partPath) }
            });
            pathBarDisplay.appendChild(partEl);
            if (index < parts.length - 1) {
                pathBarDisplay.appendChild(createElement({ tag: 'span', attributes: { class: 'path-separator' }, html: '›' }));
            }
        });
        
        pathInput.value = currentPath;
    }

    function createPathBar() {
        pathBarDisplay = createElement({ tag: 'div', attributes: { class: 'path-bar-display' }});
        pathInput = createElement({ tag: 'input', attributes: { type: 'text', class: 'path-input' } });
        
        const pathBar = createElement({
            tag: 'div',
            attributes: { class: 'path-bar' },
            on: {
                click: (e) => {
                    if (e.target.classList.contains('path-bar') || e.target.classList.contains('path-bar-display')) {
                        pathBarDisplay.style.display = 'none';
                        pathInput.style.display = 'block';
                        pathInput.focus();
                        pathInput.select();
                    }
                }
            }
        });

        pathBar.appendChild(pathBarDisplay);
        pathBar.appendChild(pathInput);

        pathInput.addEventListener('blur', () => {
            pathBarDisplay.style.display = 'flex';
            pathInput.style.display = 'none';
        });

        pathInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                navigateTo(pathInput.value.trim());
                pathInput.blur();
            }
        });

        return pathBar;
    }

    async function buildFileTree(rootPath, parentElement) {
        parentElement.innerHTML = '';
        const rootUl = createElement({ tag: 'ul' });
        parentElement.appendChild(rootUl);

        const buildNode = async (currentPath, parentUl) => {
            let items = [];
            try {
                items = await os.db.getAllKeys(currentPath);
            } catch (e) { return; }

            // Sort with folders first, then alphabetically
            items.sort((a, b) => {
                const isAFolder = a.endsWith('.folder');
                const isBFolder = b.endsWith('.folder');
                if (isAFolder && !isBFolder) return -1;
                if (!isAFolder && isBFolder) return 1;
                return a.localeCompare(b);
            });

            for (const item of items) {
                const isFolder = item.endsWith('.folder');
                const fullPath = `${currentPath}/${item}`;
                const displayName = item.replace('.folder', '');

                const li = createElement({ tag: 'li', attributes: { class: 'tree-node' } });
                const contentWrapper = createElement({ tag: 'div', attributes: { class: 'tree-node-content' }});
                
                const nameSpan = createElement({ tag: 'span', attributes: { class: 'node-name' }, html: displayName });

                if (isFolder) {
                    const toggle = createElement({ tag: 'span', attributes: { class: 'toggle' }, html: '►' });
                    contentWrapper.append(toggle, nameSpan);
                    
                    contentWrapper.onclick = () => navigateTo(fullPath);

                    const childrenUl = createElement({ tag: 'ul', attributes: { class: 'tree-children collapsed' } });
                    li.append(contentWrapper, childrenUl);

                    toggle.onclick = (e) => {
                        e.stopPropagation(); // Prevent navigation
                        const isCollapsed = childrenUl.classList.contains('collapsed');
                        if (isCollapsed) {
                            childrenUl.classList.remove('collapsed');
                            toggle.innerHTML = '▼';
                            if (!childrenUl.hasChildNodes()) {
                                buildNode(fullPath, childrenUl); // Lazy load
                            }
                        } else {
                            childrenUl.classList.add('collapsed');
                            toggle.innerHTML = '►';
                        }
                    };
                } else {
                    // It's a file
                    const fileIconPlaceholder = createElement({ tag: 'span', attributes: { class: 'toggle' } }); // for alignment
                    contentWrapper.append(fileIconPlaceholder, nameSpan);
                    contentWrapper.onclick = async () => {
                        const content = await os.db.Laynin(currentPath, item);
                        os.addWindow({ title: item, content, path: currentPath, os });
                    };
                    li.appendChild(contentWrapper);
                }
                parentUl.appendChild(li);
            }
        };
        await buildNode(rootPath, rootUl);
    }
    
    // --- Controls and Actions ---
    function setSort(by) {
        if (state.sort.by === by) {
            state.sort.order = state.sort.order === 'asc' ? 'desc' : 'asc';
        } else {
            state.sort.by = by;
            state.sort.order = 'asc';
        }
        renderFiles(state.currentPath, body);
    }
    
    function createFileExplorer() {
        const container = createElement({ tag: "div", attributes: { class: "file-explorer" } });
        
        // --- Sidebar Collapse Button ---
        const sidebarToggleBtn = createElement({
            tag: 'button',
            attributes: { class: 'sidebar-toggle-btn' },
            html: '<span>&#9776;</span>', // Hamburger icon
            on: { click: () => container.classList.toggle('sidebar-collapsed') }
        });

        const header = createElement({ tag: "div", attributes: { class: "file-explorer-header" } });
        header.appendChild(sidebarToggleBtn);

        const menuButtons = createElement({
            tag: 'div', attributes: { class: 'menu-buttons' },
            children: [
                { tag: "button", html: "New File", on: { click: async () => {
                    const name = prompt("Enter file name:");
                    if (name) {
                        await os.createFile({ path: state.currentPath, title: name, content:`//B"H\n`});
                        await renderFiles(state.currentPath, body);
                    }
                }}},
                { tag: "button", html: "New Folder", on: { click: async () => {
                    const name = prompt("Enter folder name:");
                    if (name) {
                        await os.createFolder({ path: state.currentPath, title: name });
                        await renderFiles(state.currentPath, body);
                        await buildFileTree('desktop.folder', sidebar);
                    }
                }}},
                { tag: "button", html: "Import", on: { click: () => importFiles({ os, path: state.currentPath }) }},
            ]
        });

        const viewControls = createElement({
            tag: 'div', attributes: { class: 'view-controls' },
            children: [
                { tag: 'button', html: 'Icons', on: { click: () => { state.viewMode = 'icons'; renderFiles(state.currentPath, body); } }},
                { tag: 'button', html: 'Details', on: { click: () => { state.viewMode = 'details'; renderFiles(state.currentPath, body); } }}
            ]
        });
        
        header.append(menuButtons, createPathBar(), viewControls);

        const contentArea = createElement({ tag: 'div', attributes: { class: 'file-explorer-content' }});
        sidebar = createElement({ tag: "div", attributes: { class: "file-explorer-sidebar" } });
        body = createElement({ tag: "div", attributes: { class: "file-explorer-body" } });
        
        // --- Sidebar Resizer ---
        const resizer = createElement({ tag: 'div', attributes: { class: 'sidebar-resizer' } });
        resizer.onmousedown = (e) => {
            e.preventDefault();
            document.body.style.cursor = 'col-resize';
            const startX = e.clientX;
            const startWidth = sidebar.offsetWidth;

            const doDrag = (e) => {
                const newWidth = startWidth + e.clientX - startX;
                if (newWidth > 50) { // minimum width
                    sidebar.style.width = newWidth + 'px';
                }
            };
            const stopDrag = () => {
                document.body.style.cursor = 'default';
                document.removeEventListener('mousemove', doDrag);
                document.removeEventListener('mouseup', stopDrag);
            };

            document.addEventListener('mousemove', doDrag);
            document.addEventListener('mouseup', stopDrag);
        };

        contentArea.append(sidebar, resizer, body);
        container.append(header, contentArea);

        navigateTo(state.currentPath);
        buildFileTree('desktop.folder', sidebar);

        return container;
    }

    var self = { div: createFileExplorer() };

    const style = document.createElement("style");
    style.innerHTML = myStyles;
    document.head.appendChild(style);

    return self;
};