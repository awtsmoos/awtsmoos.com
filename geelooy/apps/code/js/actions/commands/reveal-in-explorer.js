
// B"H
import { State, DOM } from '../../state.js';
import { Workspaces, getItemUniquePath } from '../../workspaces/index.js';
import { ItemResolver } from '../utils/itemResolver.js';

export default async function run(context) {
    const item = ItemResolver.resolve(context);
    if (!item || !item.path) return;

    const { workspaceId, path } = item;
    const workspace = State.workspaces.find(ws => ws.id === workspaceId);
    if (!workspace) return;

    // Open sidebar if closed
    document.querySelector('.app-container').classList.remove('sidebar-collapsed');

    const parts = path.split('/').filter(Boolean);
    let currentAccum = '';
    
    for (let i = 0; i < parts.length; i++) {
        const isLast = (i === parts.length - 1);
        currentAccum += '/' + parts[i];
        
        const pathItem = { ...item, path: currentAccum, kind: isLast ? 'file' : 'directory' };
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
                element = entry.el;
                break;
            }
            await new Promise(r => setTimeout(r, 40));
        }

        if (isLast && element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('context-active');
            setTimeout(() => element.classList.remove('context-active'), 3000);
        }
    }
}
