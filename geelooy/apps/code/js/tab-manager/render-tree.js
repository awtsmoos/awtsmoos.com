
// B"H
import { State } from '../state.js';
import { TMState } from './state.js';
import { TMUI } from './ui.js';

export const TMTreeRenderer = {
    render(container, filter, onInteract, onContext, renderGrid) {
        const tree = new Map();

        State.tabs.forEach((tab, index) => {
            if (filter && !tab.item.name.toLowerCase().includes(filter)) return;
            const ws = State.workspaces.find(w => w.id === tab.item.workspaceId);
            const wsName = ws ? ws.name : 'System / Global';
            
            let catName = '📄 Files', catIcon = 'folder';
            if (tab.fileType === 'vibe' || tab.item.type === 'vibe-session') { catName = '🧠 Vibe Sessions'; catIcon = 'brain'; }
            else if (tab.fileType === 'html-preview' || tab.isPreview) { catName = '👁️ Previews'; catIcon = 'eye'; }
            else if (tab.item.type === 'commander') { catName = '📂 Commanders'; catIcon = 'folder'; }
            else if (tab.fileType === 'terminal' || tab.item.type === 'terminal') { catName = '💻 Terminals'; catIcon = 'laptop'; }

            if (!tree.has(wsName)) tree.set(wsName, { name: wsName, pathKey: wsName, type: 'workspace', children: new Map(), tabs: [], totalTabs: 0 });
            const wsNode = tree.get(wsName);
            wsNode.totalTabs++;

            if (!wsNode.children.has(catName)) wsNode.children.set(catName, { name: catName, pathKey: wsName + '::' + catName, type: 'category', catIcon, children: new Map(), tabs: [], totalTabs: 0 });
            const catNode = wsNode.children.get(catName);
            catNode.totalTabs++;

            let current = catNode;
            let currentPathKey = catNode.pathKey;
            let dirPath = tab.item.path || '/';
            const lastSlash = dirPath.lastIndexOf('/');
            dirPath = lastSlash > 0 ? dirPath.substring(0, lastSlash) : '/';
            
            if (dirPath !== '/') {
                dirPath.split('/').filter(Boolean).forEach(part => {
                    currentPathKey += '::' + part;
                    if (!current.children.has(part)) current.children.set(part, { name: part, pathKey: currentPathKey, type: 'folder', children: new Map(), tabs: [], totalTabs: 0 });
                    current = current.children.get(part);
                    current.totalTabs++;
                });
            }
            current.tabs.push({ tab, index });
        });

        const wrap = document.createElement('div');
        wrap.className = 'tm-tree-container';
        Array.from(tree.keys()).sort().forEach(ws => this._appendNode(tree.get(ws), wrap, filter, true, onInteract, onContext, renderGrid));
        container.appendChild(wrap);
    },

    _appendNode(node, parentEl, filter, isRoot, onInteract, onContext, renderGrid) {
        const wrapper = document.createElement('div');
        wrapper.className = `tm-tree-node ${isRoot ? 'root' : 'nested'}`;
        if (filter || TMState.expandedFolders.has(node.pathKey)) wrapper.classList.add('expanded');

        const header = document.createElement('div');
        header.className = 'tm-tree-header';
        let icon = node.type === 'workspace' ? 'brain' : (node.type === 'category' ? node.catIcon : 'folder');
        
        header.innerHTML = `
            <span class="tm-folder-caret">▶</span> 
            <svg class="svg-icon tm-folder-icon"><use href="#icon-${icon}"></use></svg> 
            <span class="tm-folder-title">${node.name}</span> 
            <span class="tm-folder-count">${node.totalTabs}</span>
            <div class="tm-tree-tools" style="margin-left:auto; display:none; gap:5px;">
                 <button data-action="expand-all" style="padding:2px 6px; background:none; border:1px solid var(--color-border); border-radius:4px; color:var(--neon-lime); cursor:pointer;">+</button>
                 <button data-action="collapse-all" style="padding:2px 6px; background:none; border:1px solid var(--color-border); border-radius:4px; color:var(--color-accent-danger); cursor:pointer;">-</button>
            </div>`;

        header.onmouseenter = () => { const t = header.querySelector('.tm-tree-tools'); if(t) t.style.display = 'flex'; };
        header.onmouseleave = () => { const t = header.querySelector('.tm-tree-tools'); if(t) t.style.display = 'none'; };

        header.onclick = (e) => {
            const btn = e.target.closest('button[data-action]');
            if (btn) {
                e.stopPropagation();
                this._toggleRecursive(node, btn.dataset.action === 'expand-all');
                renderGrid();
                return;
            }
            if (wrapper.classList.contains('expanded')) { wrapper.classList.remove('expanded'); TMState.expandedFolders.delete(node.pathKey); }
            else { wrapper.classList.add('expanded'); TMState.expandedFolders.add(node.pathKey); }
            localStorage.setItem('awtsmoos_tm_expanded', JSON.stringify(Array.from(TMState.expandedFolders)));
        };

        const body = document.createElement('div');
        body.className = 'tm-tree-body';
        Array.from(node.children.keys()).sort().forEach(ck => this._appendNode(node.children.get(ck), body, filter, false, onInteract, onContext, renderGrid));
        
        if (node.tabs.length > 0) {
            const grid = document.createElement('div');
            grid.className = 'tm-tree-tabs-grid';
            node.tabs.forEach(({tab, index}) => grid.appendChild(TMUI.createCard(tab, index, false, onInteract, onContext)));
            body.appendChild(grid);
        }
        wrapper.append(header, body);
        parentEl.appendChild(wrapper);
    },

    _toggleRecursive(node, expand) {
        if (expand) TMState.expandedFolders.add(node.pathKey); else TMState.expandedFolders.delete(node.pathKey);
        node.children.forEach(c => this._toggleRecursive(c, expand));
        localStorage.setItem('awtsmoos_tm_expanded', JSON.stringify(Array.from(TMState.expandedFolders)));
    }
};
