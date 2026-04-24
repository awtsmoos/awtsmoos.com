
// B"H
import { State } from '../state.js';
import { FileSystemProvider } from '../fs-provider.js';
import { Menus } from '../menus.js';
import { Tabs } from '../tabs/index.js';
import { SelectionManager } from '../selection-manager.js';
import { getItemUniquePath, Workspaces } from '../workspaces.js';

export const WorkspaceTreeRenderer = {
    async renderTree(parentElement, parentItem, depth, registerDom = true, options = {}) {
        if (!parentElement || !parentItem) return;

        const parentPath = parentItem.path ?? "/";
        const wsId = parentItem.workspaceId ?? parentItem.id;
        const ws = State.workspaces.find(w => w?.id === wsId);
        
        parentElement.innerHTML = '<li class="tree-item loading-state" style="opacity: 0.5; padding-left: 15px;">...</li>';

        try {
            // Full integration check
            const fullParent = { ...ws, ...parentItem };
            const result = await FileSystemProvider.list(fullParent);
            const children = result?.entries || [];
            
            parentElement.innerHTML = '';

            if (children.length === 0) {
                parentElement.innerHTML = `<li class="tree-item empty-state" style="padding-left:20px; color:gray; font-style:italic;">Vessel remains empty</li>`;
                return;
            }

            if (result.isGitRoot) {
                const uniquePath = getItemUniquePath(parentItem);
                const parentEntry = State.domItemMap.get(uniquePath);
                if (parentEntry?.el) {
                    const iconUse = parentEntry.el.querySelector('.svg-icon use');
                    if (iconUse) iconUse.setAttribute('href', '#icon-git-folder');
                }
            }

            children.sort((a, b) => {
                const aIsDir = a.kind === 'directory';
                const bIsDir = b.kind === 'directory';
                if (aIsDir && !bIsDir) return -1;
                if (!aIsDir && bIsDir) return 1;
                return a.name.localeCompare(b.name);
            });

            const fragment = document.createDocumentFragment();
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (!child?.name) continue;

                const fullChildItem = { ...fullParent, ...child, workspaceId: wsId };
                const uniquePath = getItemUniquePath(fullChildItem);
                const isDir = child.kind === 'directory';

                const li = document.createElement('li');
                li.className = 'tree-item';
                if (State.selectedItems.has(uniquePath)) li.classList.add('selected');
                
                const nameWrap = document.createElement('div');
                nameWrap.className = 'tree-item-name-wrap';
                nameWrap.style.paddingLeft = (depth * 12) + 'px';
                nameWrap.innerHTML = `
                    <span class="tree-item-arrow">${isDir ? '▶' : '•'}</span>
                    <svg class="svg-icon"><use href="#icon-${isDir ? 'folder' : 'file'}"></use></svg>
                    <span class="tree-item-name">${child.name}</span>
                `;

                if (isDir) Workspaces.setupDragDrop(nameWrap, fullChildItem);

                nameWrap.onclick = (e) => {
                    e.stopPropagation();
                    if (State.isSelectionModeActive) {
                        SelectionManager.toggle(fullChildItem);
                    } else if (isDir) {
                        this.toggleDirectory(uniquePath, li, fullChildItem, depth, registerDom, options);
                    } else {
                        if (options.onFileClick) options.onFileClick(fullChildItem);
                        else Tabs.create(fullChildItem);
                    }
                };

                nameWrap.oncontextmenu = (e) => {
                    State.contextEvent = e;
                    Menus.show(e, fullChildItem);
                };

                li.appendChild(nameWrap);

                if (registerDom) State.domItemMap.set(uniquePath, { el: li, item: fullChildItem });

                if (isDir && State.expandedFolders.has(uniquePath)) {
                    li.classList.add('expanded');
                    const childUl = document.createElement('ul');
                    childUl.className = 'tree-branch';
                    li.appendChild(childUl);
                    this.renderTree(childUl, fullChildItem, depth + 1, registerDom, options);
                }

                fragment.appendChild(li);
            }
            parentElement.appendChild(fragment);

        } catch (error) {
            // B"H - Capture Locked Access Event explicitly to paint the UI button!
            if (error.name === 'LockedAccessError' || error.message.includes('LockedAccessError')) {
                parentElement.innerHTML = `
                    <li class="tree-item error-node" style="padding-left:15px; display:flex; align-items:center; gap:8px;">
                        <button class="primary-btn" style="min-height:20px; font-size:11px; padding:2px 8px; border-radius:4px;">🔑 Grant Access</button>
                    </li>
                `;
                
                // Allow user a single explicit click to demand permission invocation without browser penalty
                const btn = parentElement.querySelector('button');
                btn.onclick = async () => {
                    btn.textContent = "Negotiating...";
                    try {
                        const h = ws.handle;
                        if(h) {
                            const res = await h.requestPermission({ mode: 'readwrite' });
                            if (res === 'granted') {
                                ws.isLocked = false;
                                Workspaces.render(); // Perform universal re-flow!
                                return;
                            }
                        }
                    } catch(e){}
                    btn.textContent = "Refused";
                };
            } else {
                console.error("[Tree] Collapse during traversal:", error);
                parentElement.innerHTML = `<li class="tree-item" style="color:var(--color-accent-danger); font-size:0.8em; padding-left:15px;">Fragmented: ${error.message}</li>`;
            }
        }
    },

    toggleDirectory(uniquePath, liElement, item, depth, registerDom, options) {
        if (!liElement) return;

        if (State.expandedFolders.has(uniquePath)) {
            State.expandedFolders.delete(uniquePath);
            liElement.classList.remove('expanded');
            const existingUl = liElement.querySelector('ul');
            if (existingUl) existingUl.remove();
        } else {
            State.expandedFolders.add(uniquePath);
            liElement.classList.add('expanded');
            const newUl = document.createElement('ul');
            newUl.className = 'tree-branch';
            liElement.appendChild(newUl);
            this.renderTree(newUl, item, depth + 1, registerDom, options);
        }
        
        import('../app.js').then(m => m.App.saveSessionDebounced());
    }
};
