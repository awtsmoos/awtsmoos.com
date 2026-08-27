
// B"H
/**
 * @file NodeRefresher.js
 * @brief The ritual of renewing a specific node's revelation.
 * 
 * CHAPTER III: THE CONSTANT REFRESH
 * "In His goodness, He renews the work of creation every day, constantly."
 * A folder is not a static object; it is a flow of data.
 * When the disk changes, the visual node must be recreated 
 * from nothingness once more to reflect the current Truth.
 * We clear the old children, we signal the State,
 * Ensuring the Tree is not left to its fate.
 * Through this refresh, the latest emanations 
 * find their way into the user's perception.
 */

import { State } from '../../state.js';
import { getItemUniquePath } from '../utils.js';
import { NodeRegistry } from './NodeRegistry.js';
import { WorkspaceTreeRenderer } from '../tree-rendering.js';

/**
 * @class NodeRefresher
 * @description Manages the targeted re-rendering of directory branches.
 */
export class NodeRefresher {
    /**
     * B"H - Forces a specific directory node to re-manifest its children.
     * @param {Object} item - The directory vessel to be refreshed.
     */
    static async refresh(item) {
        if (!item) return;
        
        const uniquePath = getItemUniquePath(item);
        const entry = NodeRegistry.get(uniquePath);
        
        if (!entry) {
            console.warn("B\"H [NodeRefresher] Vessel " + uniquePath + " not found in registry. Rebuilding root.");
            return;
        }

        // Locate the physical container for the sub-branch
        let childrenContainer = entry.el.querySelector('ul');
        
        if (childrenContainer) {
            // Dissolution of old forms
            childrenContainer.innerHTML = '';
        } else {
            // Creation of a new sub-vessel
            childrenContainer = document.createElement('ul');
            childrenContainer.className = 'tree-branch';
            entry.el.appendChild(childrenContainer);
            
            // Mark as expanded in the spirit of the State
            entry.el.classList.add('expanded');
            State.expandedFolders.add(uniquePath);
        }
        
        // Calculate the depth of this manifestation
        const depth = (item.path.split('/').filter(Boolean)).length;
        
        console.log("B\"H [NodeRefresher] Refreshing branch: " + uniquePath);
        
        // Descent: Call the master renderer to populate the container
        await WorkspaceTreeRenderer.renderTree(childrenContainer, item, depth + 1);
    }
}
