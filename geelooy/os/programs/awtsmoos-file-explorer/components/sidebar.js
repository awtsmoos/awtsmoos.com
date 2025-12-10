// B"H
import { createElement } from "/scripts/awtsmoos/ui/basic.js";
import { getChevronIcon } from "../utils/icons.js";
import { handleDragOver, handleDragLeave, handleDrop } from "../utils/dragDrop.js";
import { showContextMenu } from '/os/contextMenuManager.js';

export  default function createSidebar({ state, os, onNavigate, onRefresh }) {
    const sidebar = createElement({ tag: "div", attributes: { class: "file-explorer-sidebar" } });

    // Recursive function to build tree
    const buildNode = async (currentPath, parentUl) => {
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
            try { items = await os.db.getAllKeys(currentPath); } catch (e) { return; }
        }
        
        items.sort((a, b) => {
            const aIsFolder = a.type === 'directory' || a.name.endsWith('.folder') || currentPath === '/';
            const bIsFolder = b.type === 'directory' || b.name.endsWith('.folder') || currentPath === '/';
            if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;
            return (a.name || "").localeCompare(b.name || "");
        });

        for (const itemObj of items) {
            const item = itemObj.name;
            const isFolder = itemObj.type === 'directory' || item.endsWith('.folder') || currentPath === '/';
            const fullPath = currentPath === '/' ? item : `${currentPath}/${item}`;
            
            const li = createElement({ tag: 'li', attributes: { 'data-full-path': fullPath, class: 'tree-node' }});
            const contentWrapper = createElement({ 
                tag: 'div', 
                attributes: { class: 'tree-node-content' },
                on: {
                    dragover: isFolder ? handleDragOver : null,
                    dragleave: isFolder ? handleDragLeave : null,
                    drop: isFolder ? (e) => handleDrop(e, fullPath, os, null, onRefresh) : null
                }
            });
            
            const nameSpan = createElement({ tag: 'span', attributes: { class: 'node-name' }, html: item });

            if (isFolder) {
                const toggle = createElement({ 
                    tag: 'div', 
                    attributes: { class: 'toggle-icon' }, 
                    html: getChevronIcon() 
                });
                
                contentWrapper.append(toggle, nameSpan);
                const childrenUl = createElement({ tag: 'ul', attributes: { class: 'tree-children collapsed' }});

                const expand = async () => {
                    if (childrenUl.classList.contains('collapsed')) {
                        childrenUl.classList.remove('collapsed');
                        toggle.classList.add('expanded');
                        await buildNode(fullPath, childrenUl);
                    }
                };
                const collapse = () => {
                    childrenUl.classList.add('collapsed');
                    toggle.classList.remove('expanded');
                };
                
                toggle.onclick = (e) => { e.stopPropagation(); childrenUl.classList.contains('collapsed') ? expand() : collapse(); };
                contentWrapper.onclick = (e) => { e.stopPropagation(); onNavigate(fullPath); };
                li.append(contentWrapper, childrenUl);
            } else {
                const spacer = createElement({ tag: 'div', attributes: { class: 'toggle-icon' } });
                contentWrapper.append(spacer, nameSpan);
                contentWrapper.onclick = () => {
                     const content = os.db.Laynin(currentPath, item).then(c => os.addWindow({ title: item, content: c, path: currentPath, os }));
                };
                li.appendChild(contentWrapper);
            }
            
            contentWrapper.oncontextmenu = event => showContextMenu({ 
                os, event, path: currentPath, title: item, isFolder, 
                onRefresh, onOpen: () => onNavigate(fullPath)
            });
            parentUl.appendChild(li);
        }
    };

    // Public method to sync selection
    const syncSelection = async (path) => {
        sidebar.querySelectorAll('.tree-node-content.selected').forEach(el => el.classList.remove('selected'));
        const homeLi = sidebar.querySelector('li[data-full-path="/"]');
        if (!homeLi) return; 

        if (path === '/' || path === '') {
            homeLi.querySelector('.tree-node-content').classList.add('selected');
            return;
        }

        const parts = path.split('/').filter(Boolean);
        let parentElement = homeLi; 
        
        // Ensure home is expanded
        const homeUl = homeLi.querySelector(':scope > .tree-children');
        if (homeUl.classList.contains('collapsed')) {
            homeUl.classList.remove('collapsed');
            homeLi.querySelector('.toggle-icon')?.classList.add('expanded');
            await buildNode('/', homeUl);
        }

        for (const part of parts) {
            let currentParentPath = parentElement.getAttribute('data-full-path');
            if (currentParentPath === '/') currentParentPath = ''; 
            let segmentToFind = currentParentPath ? `${currentParentPath}/${part}` : part;
            
            let nodeLi = parentElement.querySelector(`:scope > ul > li[data-full-path="${segmentToFind}"]`);
            if (!nodeLi) nodeLi = parentElement.querySelector(`:scope > ul > li[data-full-path="${segmentToFind}.folder"]`);
            if (!nodeLi) return;

            const childrenUl = nodeLi.querySelector(':scope > .tree-children');
            if (childrenUl && childrenUl.classList.contains('collapsed')) {
                childrenUl.classList.remove('collapsed');
                nodeLi.querySelector('.toggle-icon')?.classList.add('expanded');
                await buildNode(nodeLi.getAttribute('data-full-path'), childrenUl); 
            }
            parentElement = nodeLi; 
        }
        parentElement.querySelector(':scope > .tree-node-content')?.classList.add('selected');
    };

    // Initial Build
    const rootUl = createElement({ tag: 'ul' });
    sidebar.appendChild(rootUl);
    
    // Manually create root Home node
    const homeLi = createElement({ tag: 'li', attributes: { 'data-full-path': '/', class: 'tree-node' }});
    const homeContent = createElement({ 
        tag: 'div', attributes: { class: 'tree-node-content' },
        on: { drop: (e) => handleDrop(e, '/', os, null, onRefresh), dragover: handleDragOver, dragleave: handleDragLeave }
    });
    const homeToggle = createElement({ tag: 'div', attributes: { class: 'toggle-icon' }, html: getChevronIcon() });
    const homeName = createElement({ tag: 'span', attributes: { class: 'node-name' }, html: 'Home' });
    homeContent.append(homeToggle, homeName);
    const homeChildrenUl = createElement({ tag: 'ul', attributes: { class: 'tree-children collapsed' }});
    
    homeToggle.onclick = (e) => { e.stopPropagation(); homeChildrenUl.classList.contains('collapsed') ? 
        (homeChildrenUl.classList.remove('collapsed'), homeToggle.classList.add('expanded'), buildNode('/', homeChildrenUl)) : 
        (homeChildrenUl.classList.add('collapsed'), homeToggle.classList.remove('expanded')); 
    };
    homeContent.onclick = () => onNavigate('/');
    
    homeLi.append(homeContent, homeChildrenUl);
    rootUl.appendChild(homeLi);

    return { dom: sidebar, syncSelection, rebuild: () => buildNode('/', homeChildrenUl) }; // Exposed for external use
}