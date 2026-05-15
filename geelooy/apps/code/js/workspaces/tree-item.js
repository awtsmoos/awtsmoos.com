
// B"H
// FILE: js/workspaces/tree-item.js

import { State } from '../state.js';
import { Menus } from '../menus/index.js';
import { Tabs } from '../tabs/index.js';
import { SelectionManager } from '../selection-manager.js';
import { WorkspaceTreeRenderer } from './tree-renderer.js';
import { getItemUniquePath } from './utils.js';

/**
 * @class TreeItemForge
 * @classdesc The smithy where the physical forms of the project's elements are struck.
 */
export const TreeItemForge = {
    create(item, depth) {
        const uniquePath = getItemUniquePath(item);
        const isDir = item.kind === 'directory';
        const li = document.createElement('li');
        li.className = `tree-item ${isDir ? 'dir' : 'file'}`;

        const wrapper = document.createElement('div');
        wrapper.className = 'tree-item-name-wrap';
        wrapper.style.paddingLeft = `${depth * 12}px`;

        let icon = 'file';
        if (isDir) {
            const isActualRoot = item.path === '/' || item.path === '' || item.isWorkspaceRoot;
            const isCloneRoot = item.isGitClone && (isActualRoot || item._isDetectedGitRoot);
            icon = isCloneRoot ? 'git-folder' : 'folder';
        }

        const syncLinks = Array.isArray(State.folderSyncLinks) ? State.folderSyncLinks : [];
        const wsId = item.workspaceId || item.id;
        const isSyncedFolder = isDir && syncLinks.some(link => {
            const s = link.source || {};
            const t = link.target || {};
            return (String(s.workspaceId) === String(wsId) && s.path === item.path) ||
                   (String(t.workspaceId) === String(wsId) && t.path === item.path);
        });
        const syncBadge = isSyncedFolder
            ? '<span class="tree-sync-badge" title="Folder Sync Link" style="margin-left:6px;opacity:.9;">🔗</span>'
            : '';

        wrapper.innerHTML = `
            <span class="tree-item-arrow">${isDir ? '▶' : '•'}</span>
            <svg class="svg-icon"><use href="#icon-${icon}"></use></svg>
            <span class="tree-item-name">${item.name}</span>${syncBadge}
        `;

        wrapper.onclick = (e) => {
            e.stopPropagation();
            if (State.isSelectionModeActive) {
                SelectionManager.toggle(item);
            } else if (isDir) {
                WorkspaceTreeRenderer.toggleDirectory(uniquePath, li, item, depth);
            } else {
                Tabs.create(item);
            }
        };

        wrapper.oncontextmenu = (e) => {
            State.contextEvent = e;
            Menus.show(e, item);
        };

        li.appendChild(wrapper);
        State.domItemMap.set(uniquePath, { el: li, item });

        if (isDir && State.expandedFolders.has(uniquePath)) {
            li.classList.add('expanded');
            const ul = document.createElement('ul');
            li.appendChild(ul);
            setTimeout(() => WorkspaceTreeRenderer.renderTree(ul, item, depth + 1), 0);
        }

        return li;
    }
};
