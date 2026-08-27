
// B"H
/**
 * @file builder.js
 * @brief The Construct of the Tree with event binding.
 * 
 * THE HYMN OF THE FAITHFUL MIRROR:
 * As above, so below. Every branch of the tree in the preview 
 * must have a corresponding image in the inspector. 
 * We iterate through the childNodes—the complete population of the vessel—
 * ensuring that nothing, not even a wisp of text, is lost in the mapping.
 */

import { HTML } from '../../../../html-generator.js';
import { TagLogic } from './tags.js';
import { AttributeRenderer } from './attributes.js';

/**
 * @class DOMTreeBuilder
 * @description Recursively manifests DOM elements into the devtools tree UI.
 */
export const DOMTreeBuilder = {
    /**
     * B"H - Recursively builds a devtools tree node from a real DOM element.
     * @param {Node} node - The source node from the preview.
     * @param {Array<number>} path - The sequence of indices to reach this node.
     * @param {Function} onInteract - Callback for user interaction (clicks).
     * @returns {HTMLElement|null} The manifested tree element.
     */
    buildNode(node, path = [], onInteract = null) {
        // We only manifest Element Nodes as collapsible branches.
        if (!node || node.nodeType !== Node.ELEMENT_NODE) return null;

        const tagName = node.tagName.toLowerCase();
        const pathStr = path.join(',');
        
        const details = document.createElement('details');
        details.className = 'dt-el-node';
        details.dataset.path = pathStr;

        const summary = document.createElement('summary');
        summary.className = 'dt-el-summary';
        
        // B"H - Bind user interactions
        summary.onclick = (e) => {
            e.preventDefault(); e.stopPropagation();
            if (onInteract) onInteract(node, path, { type: 'click' });
        };

        // Manifest the Opening Tag with its Adornments (Attributes)
        const openTag = TagLogic.renderOpen(tagName, AttributeRenderer.render(node.attributes));
        summary.appendChild(HTML({ tag: 'span', children: openTag }));
        details.appendChild(summary);

        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'dt-el-children';

        // CHAPTER IX: THE GATHERING OF THE CHILDREN
        // We use childNodes to ensure absolute path indexing alignment with the Injected Interceptor.
        Array.from(node.childNodes).forEach((child, i) => {
            if (child.nodeType === Node.ELEMENT_NODE) {
                // Descend into the sub-branch
                const childNode = this.buildNode(child, [...path, i], onInteract);
                if (childNode) childrenContainer.appendChild(childNode);
            } 
            else if (child.nodeType === Node.TEXT_NODE) {
                const txt = child.textContent.trim();
                // We only manifest visible text to keep the view focused on essence.
                if (txt) {
                    childrenContainer.appendChild(HTML({ 
                        tag: 'div', 
                        className: 'dt-el-text', 
                        text: txt 
                    }));
                }
            }
            else if (child.nodeType === Node.COMMENT_NODE) {
                childrenContainer.appendChild(HTML({
                    tag: 'div',
                    className: 'dt-el-comment',
                    text: `<!-- \${child.textContent.trim()} -->`
                }));
            }
        });

        details.appendChild(childrenContainer);
        
        // Manifest the Closing Gate
        details.appendChild(HTML({ 
            className: 'dt-el-close', 
            children: [TagLogic.renderClose(tagName)] 
        }));

        return details;
    }
};
