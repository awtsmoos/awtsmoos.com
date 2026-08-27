
// B"H
/**
 * @file tree-rendering.js
 * @brief The conductor of the Workspace Sidebar Tree.
 */

import { TraversalWisdom } from './tree-rendering/TraversalWisdom.js';
import { NodeManifestor } from './tree-rendering/NodeManifestor.js';
import { InteractionRituals } from './tree-rendering/InteractionRituals.js';
import { FolderTogglery } from './tree-rendering/FolderTogglery.js';
import { ErrorVessel } from './tree-rendering/ErrorVessel.js';
import { State } from '../state.js';
import { getItemUniquePath } from './utils.js';

/**
 * @class WorkspaceTreeRenderer
 * @description Orchestrates the manifestation of the sidebar directory tree.
 */
export const WorkspaceTreeRenderer = {
    /**
     * B"H - Manifests a specific branch of the project hierarchy.
     * @param {HTMLElement} parentEl - Physical container for children.
     * @param {Object} parentItem - The directory essence.
     * @param {number} depth - Level of descent from root.
     * @param {boolean} register - Whether to track these nodes.
     * @param {Object} options - Custom interaction handlers.
     */
    async renderTree(parentEl, parentItem, depth, register = true, options = {}) {
        if (!parentEl || !parentItem) return;

        // Visual Placeholder: The Pulse of Creation
        parentEl.innerHTML = '<li style="opacity:0.5; padding-left:15px;">...</li>';

        try {
            // 1. ASCERTAIN THE POPULATION (Binah)
            const children = await TraversalWisdom.getChildren(parentItem);
            parentEl.innerHTML = '';

            if (children.length === 0) {
                parentEl.innerHTML = '<li style="padding-left:20px; color:gray; font-style:italic;">Vessel remains empty</li>';
                return;
            }

            // 2. MANIFEST EACH SPARK (Asiyah)
            const fragment = document.createDocumentFragment();
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                const fullChild = { 
                    ...parentItem, 
                    ...child, 
                    workspaceId: parentItem.workspaceId || parentItem.id 
                };

                const li = NodeManifestor.manifest(fullChild, depth, register);
                
                // 3. BIND THE RITUALS (Chochmah)
                const wrapper = li.querySelector('.tree-item-name-wrap');
                InteractionRituals.bind(wrapper, fullChild, {
                    depth: depth,
                    options: options,
                    toggleFn: (item, d) => FolderTogglery.toggle(item, d, this.renderTree.bind(this))
                });

                // RECTIFIED: Use ES import "getItemUniquePath" instead of "require"
                const childUniqueKey = getItemUniquePath(fullChild);

                // If already expanded in State, trigger sub-descent immediately
                if (fullChild.kind === 'directory' && State.expandedFolders.has(childUniqueKey)) {
                    li.classList.add('expanded');
                    const childUl = document.createElement('ul');
                    childUl.className = 'tree-branch';
                    li.appendChild(childUl);
                    this.renderTree(childUl, fullChild, depth + 1, register, options);
                }

                fragment.appendChild(li);
            }
            parentEl.appendChild(fragment);

        } catch (e) {
            this._handleError(parentEl, parentItem, e);
        }
    },

    /**
     * @private
     * Handles shattered vessels by providing access or error messages.
     */
    _handleError: function(parentEl, parentItem, e) {
        parentEl.innerHTML = '';
        const wsId = parentItem.workspaceId || parentItem.id;
        const ws = State.workspaces.find(w => String(w?.id) === String(wsId));

        if (e.name === 'LockedAccessError' || e.message.indexOf('sealed') !== -1) {
            ErrorVessel.manifestLockedUI(parentEl, ws);
        } else {
            ErrorVessel.manifestGeneric(parentEl, e, ws);
        }
    },

    /**
     * B"H - External interface for toggling a directory.
     */
    toggleDirectory: function(uniquePath, liElement, item, depth, register = true, options = {}) {
        return FolderTogglery.toggle(item, depth, (ul, it, d) => this.renderTree(ul, it, d, register, options));
    }
};
