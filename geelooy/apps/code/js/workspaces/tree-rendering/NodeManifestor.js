
// B"H
/**
 * @file NodeManifestor.js
 * @brief Forging the physical DOM structures of the tree.
 * 
 * POEM OF THE PURE CARVING:
 * We do not use the backtick, for it hides the truth in shade,
 * We use the simple plus-sign, for that is how the worlds are made.
 * One string plus one variable, a union pure and bright,
 * Manifesting every node in the clear and holy light.
 */

import { getItemUniquePath } from '../utils.js';
import { State } from '../../state.js';
import { NodeRegistry } from '../manager/NodeRegistry.js';
import { Workspaces } from '../index.js';

/**
 * @class NodeManifestor
 * @description Manifests list items for the directory tree.
 */
export const NodeManifestor = {
    /**
     * B"H - Manifests a single node element with pure concatenation.
     * @param {Object} item - The item metadata.
     * @param {number} depth - Indentation level.
     * @param {boolean} register - Whether to track in NodeRegistry.
     * @returns {HTMLElement} The manifested li.
     */
    manifest: function(item, depth, register) {
        const isDir = item.kind === 'directory';
        const uniquePath = getItemUniquePath(item);

        const li = document.createElement('li');
        li.className = 'tree-item';
        if (State.selectedItems.has(uniquePath)) {
            li.classList.add('selected');
        }
        
        const nameWrap = document.createElement('div');
        nameWrap.className = 'tree-item-name-wrap';
        nameWrap.style.paddingLeft = (depth * 12) + 'px';
        
        const arrow = isDir ? '▶' : '•';
        const icon = isDir ? 'folder' : 'file';
        
        // B"H - RECTIFIED: Using pure string concatenation. No backticks. No escapes.
        nameWrap.innerHTML = 
            '<span class="tree-item-arrow">' + arrow + '</span>' +
            '<svg class="svg-icon"><use href="#icon-' + icon + '"></use></svg>' +
            '<span class="tree-item-name">' + item.name + '</span>';

        if (isDir) {
            Workspaces.setupDragDrop(nameWrap, item);
        }

        li.appendChild(nameWrap);

        if (register) {
            NodeRegistry.register(item, li);
        }

        return li;
    }
};
