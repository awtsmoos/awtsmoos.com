
// B"H
/**
 * @file reveal-in-workspace.js
 * @brief TRACING THE SEFIROT THROUGH FOLDER NODES.
 */

import { ItemResolver } from '../utils/itemResolver.js';
import { Dialog } from '../utils/dialog.js';

export default async function run(context) {
    const item = ItemResolver.resolve(context);
    
    if (!item || !item.path) {
        console.warn("B\"H - Reveal Sequence Failed: Found absolute obscurity.", context);
        await Dialog.alert("B\"H\nWe must see an item to find an item! Could not locate origin node.");
        return;
    }

    console.log(`B"H - Executing command -> Descend through visual UI logic paths for: ${item.path}`);

    // B"H - Step 1: Tell everything external a selection shift must occur visually.
    window.dispatchEvent(new CustomEvent('awtsmoos-reveal-item', { detail: { item } }));
    
    // B"H - Step 2: Open up each level to unhide deeply bound HTML wrappers inside closed DOM.
    const pathSegments = item.path.split('/').filter(Boolean);
    let recursiveCurrentPath = '';
    
    for (const linkPart of pathSegments) {
        recursiveCurrentPath += '/' + linkPart;
        
        // Aggressively attempt variable node formats.
        const levelNodes = document.querySelectorAll(`[data-path="${recursiveCurrentPath}"],[data-id="${recursiveCurrentPath}"]`);
        
        levelNodes.forEach(nodeContainer => {
            const hasAwokenAlready = nodeContainer.classList.contains('expanded') || nodeContainer.getAttribute('aria-expanded') === 'true';
            
            // Send synthetic toggle signals safely against child DOM blocks holding standard tree functionality classes.
            if (!hasAwokenAlready) {
                const togglerClick = nodeContainer.querySelector('.chevron, .toggle, .folder-icon, .icon') || nodeContainer;
                if (togglerClick) togglerClick.click(); 
            }
        });
    }
    
    // B"H - Step 3: Draw attention visually to the leaf in space and time constraints matching the fetch responses
    setTimeout(() => {
        const resultTargets = document.querySelectorAll(`[data-path="${item.path}"],[data-id="${item.path}"]`);
        
        resultTargets.forEach(tgtNode => {
            targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Brief visual baptism marking discovery location with divine mint coloring
            const orgBkg = tgtNode.style.backgroundColor;
            tgtNode.style.backgroundColor = 'rgba(0, 255, 204, 0.6)';
            tgtNode.style.transition = 'background-color 0.4s';
            
            setTimeout(() => {
                tgtNode.style.backgroundColor = orgBkg;
                setTimeout(() => tgtNode.style.transition = '', 500); 
            }, 1000);
        });
    }, 450); 
}
