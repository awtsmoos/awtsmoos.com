
// B"H
/**
 * @file reveal-in-explorer.js
 * @brief TRACING THE SEFIROT THROUGH FOLDER NODES.
 */

import { State } from '../../state.js';
import { Workspaces, getItemUniquePath } from '../../workspaces/index.js';
import { ItemResolver } from '../utils/itemResolver.js';

export default async function run(context) { 
    const initialItem = ItemResolver.resolve(context);
    if (!initialItem) return;

    let targetItem = { ...initialItem };

    // B"H - VIRTUAL-TO-PHYSICAL MAPPING
    // Use the active tab's session data if it's a virtual vessel
    const activeTab = State.tabs.find(t => t.id === State.activeTabId);
    if (activeTab) {
        if (activeTab.fileType === 'vibe' || activeTab.item.type === 'vibe-session') {
            const rootPath = activeTab.vibeSession?.path || activeTab.vibeSession?.rootPath || "/";
            targetItem.path = rootPath;
            targetItem.kind = 'directory';
        } else if (activeTab.item.type === 'terminal') {
            targetItem.path = activeTab.terminalState?.cwd?.path || "/";
            targetItem.kind = 'directory';
        }
    }

    const { workspaceId, path } = targetItem; 
    const workspace = State.workspaces.find(ws => ws.id === workspaceId);
    if (!workspace) return;

    document.querySelector('.app-container').classList.remove('sidebar-collapsed');

    const normalizedPath = path.replace(/\\/g, '/').replace(/\/+$/, '');
    const parts = normalizedPath.split('/').filter(Boolean);
    let currentAccum = '';
    
    if (parts.length === 0) {
        const rootPathKey = getItemUniquePath({ ...targetItem, path: '/', kind: 'directory' });
        const entry = State.domItemMap.get(rootPathKey);
        if (entry?.el) {
            entry.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            entry.el.classList.add('context-active');
            setTimeout(() => entry.el.classList.remove('context-active'), 3000);
        }
        return;
    }

    for (let i = 0; i < parts.length; i++) {
        const isLast = (i === parts.length - 1);
        currentAccum += '/' + parts[i];
        
        const pathItem = { ...targetItem, path: currentAccum, kind: isLast ? (targetItem.kind || 'file') : 'directory' };
        const uniquePath = getItemUniquePath(pathItem);
        
        if (!isLast && !State.expandedFolders.has(uniquePath)) {
            await Workspaces.refreshNode(pathItem);
        }

        let element = null;
        for (let attempt = 0; attempt < 10; attempt++) {
            const entry = State.domItemMap.get(uniquePath);
            if (entry?.el && entry.el.offsetParent !== null) {
                element = entry.el;
                break;
            }
            await new Promise(r => setTimeout(r, 100));
        }

        if (isLast && element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const wrap = element.querySelector('.tree-item-name-wrap') || element;
            wrap.classList.add('context-active');
            setTimeout(() => wrap.classList.remove('context-active'), 3000);
        }
    }
}
