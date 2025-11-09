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
        
        // Create the parent element first
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

        // Manually append the already-created child elements
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

            for (const item of items) {
                if (item.endsWith('.folder')) {
                    const folderPath = `${currentPath}/${item}`;
                    const li = createElement({ tag: 'li', attributes: { class: 'tree-node' } });
                    
                    const toggle = createElement({ tag: 'span', attributes: { class: 'toggle' }, html: '►' });
                    const nameSpan = createElement({
                        tag: 'span',
                        attributes: { class: 'node-name' },
                        html: item.replace('.folder', ''),
                        on: { click: () => navigateTo(folderPath) }
                    });

                    li.append(toggle, nameSpan);
                    parentUl.appendChild(li);

                    const childrenUl = createElement({ tag: 'ul', attributes: { class: 'tree-children collapsed' } });
                    li.appendChild(childrenUl);

                    toggle.onclick = (e) => {
                        e.stopPropagation();
                        const isCollapsed = childrenUl.classList.contains('collapsed');
                        if (isCollapsed) {
                            childrenUl.classList.remove('collapsed');
                            toggle.innerHTML = '▼';
                            if (!childrenUl.hasChildNodes()) { // Lazy load children
                                buildNode(folderPath, childrenUl);
                            }
                        } else {
                            childrenUl.classList.add('collapsed');
                            toggle.innerHTML = '►';
                        }
                    };
                }
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
        const header = createElement({ tag: "div", attributes: { class: "file-explorer-header" } });
        
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
        
        contentArea.append(sidebar, body);
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