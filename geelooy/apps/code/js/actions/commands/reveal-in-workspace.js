
// B"H
/**
 * @file reveal-in-workspace.js
 * @brief TRACING THE SEFIROT THROUGH FOLDER NODES.
 * 
 * THE POEM OF THE REVELATION:
 * Why wander through the shadows, clicking blindly in the dark,
 * Hoping that the DOM is ready to reveal its holy spark?
 * We simply write the intent within the State's eternal book,
 * And command the world to render everywhere we wish to look!
 * The paths burst open instantly, the hidden is made known,
 * And the scroll arrives directly at the requested node's throne.
 */

import { State } from '../../state.js';
import { Workspaces, getItemUniquePath } from '../../workspaces/index.js';
import { ItemResolver } from '../utils/itemResolver.js';

export default async function run(context) {
    const item = ItemResolver.resolve(context);
    if (!item || !item.path) {
        console.warn("B\"H - Reveal aborted: Target lost to the void.");
        return;
    }

    const wsId = item.workspaceId || item.id;
    const workspace = State.workspaces.find(ws => String(ws.id) === String(wsId));
    if (!workspace) return;

    // 1. Uncollapse the Sidebar
    const appContainer = document.querySelector('.app-container');
    if (appContainer && appContainer.classList.contains('sidebar-collapsed')) {
        appContainer.classList.remove('sidebar-collapsed');
        await new Promise(r => setTimeout(r, 250)); // Wait for slide animation
    }

    const normalizedPath = item.path.replace(/\\/g, '/').replace(/\/+$/, '');
    const parts = normalizedPath.split('/').filter(Boolean);
    
    // 2. Mark all parent directories as expanded
    State.expandedFolders.add(`${wsId}::/`);
    let currentAccum = '';
    
    // We iterate up to parts.length - 1 to expand only the PARENTS of the target file/folder
    for (let i = 0; i < parts.length - 1; i++) {
        currentAccum += '/' + parts[i];
        State.expandedFolders.add(`${wsId}::${currentAccum}`);
    }

    // 3. Command the Tree to re-manifest fully based on the new state
    await Workspaces.render();

    // 4. Scroll exactly to the target node
    const finalUniqueKey = getItemUniquePath(item);
    
    // A slight delay ensures the browser layout engine has fully painted the new DOM height
    setTimeout(() => {
        const entry = State.domItemMap.get(finalUniqueKey);
        if (entry && entry.el) {
            entry.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add visual glow
            const wrap = entry.el.querySelector('.tree-item-name-wrap') || entry.el;
            wrap.classList.add('context-active');
            setTimeout(() => wrap.classList.remove('context-active'), 3000);
        } else {
            console.warn(`B"H - Reveal failure: Physical element for ${finalUniqueKey} did not manifest.`);
        }
    }, 150);
}
