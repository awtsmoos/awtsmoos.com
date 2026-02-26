
// B"H
/**
 * @file reveal-in-workspace.js
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

    document.querySelector('.app-container').classList.remove('sidebar-collapsed');

    const normalizedPath = path.replace(/\\/g, '/').replace(/\/+$/, '');
    const parts = normalizedPath.split('/').filter(Boolean);
    let currentAccum = '';
    
    if (parts.length === 0) {
        const rootPathKey = getItemUniquePath({ ...item, path: '/', kind: 'directory' });
        const entry = State.domItemMap.get(rootPathKey);
        if (entry && entry.el) {
            entry.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            entry.el.classList.add('context-active');
            setTimeout(() => entry.el.classList.remove('context-active'), 3000);
        }
        return;
    }

    for (let i = 0; i < parts.length; i++) {
        const isLast = (i === parts.length - 1);
        currentAccum += '/' + parts[i];
        
        const segmentItem = { ...item, path: currentAccum, kind: isLast ? (item.kind || 'file') : 'directory' };
        const uniqueKey = getItemUniquePath(segmentItem);
        
        if (!isLast && !State.expandedFolders.has(uniqueKey)) {
            await Workspaces.refreshNode(segmentItem);
        }

        let element = null;
        for (let attempt = 0; attempt < 40; attempt++) {
            const entry = State.domItemMap.get(uniqueKey);
            if (entry && entry.el && document.contains(entry.el)) {
                if (entry.el.offsetParent !== null) { element = entry.el; break; }
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
