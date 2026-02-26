
// B"H
/**
 * @file reveal-in-workspace.js
 * @brief TRACING THE SEFIROT THROUGH FOLDER NODES.
 */

import { State } from '../../state.js';
import { Workspaces, getItemUniquePath } from '../../workspaces/index.js';
import { ItemResolver } from '../utils/itemResolver.js';

export default async function run(context) {
    const item = ItemResolver.resolve(context);
    if (!item || !item.path) return;

    const { workspaceId, path } = item;
    const workspace = State.workspaces.find(ws => ws.id === workspaceId);
    if (!workspace) return;

    // Reveal the sidebar if it is hidden
    document.querySelector('.app-container').classList.remove('sidebar-collapsed');

    const parts = path.split('/').filter(Boolean);
    let currentAccum = '';
    
    // Base case: if it's the root itself
    if (parts.length === 0) {
        const rootPath = getItemUniquePath({ ...item, path: '/', kind: 'directory' });
        const entry = State.domItemMap.get(rootPath);
        if (entry && entry.el) {
            entry.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            entry.el.classList.add('context-active');
            setTimeout(() => entry.el.classList.remove('context-active'), 3000);
        }
        return;
    }

    // Traverse the path, expanding as we go
    for (let i = 0; i < parts.length; i++) {
        const isLast = (i === parts.length - 1);
        currentAccum += '/' + parts[i];
        
        const pathItem = { ...item, path: currentAccum, kind: isLast ? (item.kind || 'file') : 'directory' };
        const uniquePath = getItemUniquePath(pathItem);
        
        // Open parent folders
        if (!isLast && !State.expandedFolders.has(uniquePath)) {
            await Workspaces.refreshNode(pathItem);
        }

        // Find and highlight target
        let element = null;
        for (let attempt = 0; attempt < 25; attempt++) {
            const entry = State.domItemMap.get(uniquePath);
            if (entry && entry.el) {
                // Ensure it is rendered in the DOM
                if (entry.el.offsetParent !== null) {
                    element = entry.el;
                    break;
                }
            }
            await new Promise(r => setTimeout(r, 40));
        }

        if (isLast && element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const wrap = element.querySelector('.tree-item-name-wrap') || element;
            wrap.classList.add('context-active');
            setTimeout(() => wrap.classList.remove('context-active'), 3000);
        }
    }
}
