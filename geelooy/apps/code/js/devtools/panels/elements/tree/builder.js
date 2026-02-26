
// B"H
/**
 * @file builder.js
 * @brief The Construct of the Tree with event binding.
 */

import { HTML } from '../../../../html-generator.js';
import { TagLogic } from './tags.js';
import { AttributeRenderer } from './attributes.js';

export const DOMTreeBuilder = {
    buildNode(node, path = [], onInteract = null) {
        if (!node || node.nodeType !== Node.ELEMENT_NODE) return null;

        const tagName = node.tagName.toLowerCase();
        const pathStr = path.join(',');
        
        const details = document.createElement('details');
        details.className = 'dt-el-node';
        details.dataset.path = pathStr;

        const summary = document.createElement('summary');
        summary.className = 'dt-el-summary';
        
        // B"H - Bind interactions
        summary.onclick = (e) => onInteract && onInteract(node, path, e);
        summary.oncontextmenu = (e) => onInteract && onInteract(node, path, e);

        const openTag = TagLogic.renderOpen(tagName, AttributeRenderer.render(node.attributes));
        summary.appendChild(HTML({ tag: 'span', children: openTag }));
        details.appendChild(summary);

        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'dt-el-children';

        Array.from(node.childNodes).forEach((child, i) => {
            if (child.nodeType === Node.ELEMENT_NODE) {
                const childNode = this.buildNode(child, [...path, i], onInteract);
                if (childNode) childrenContainer.appendChild(childNode);
            } else if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
                childrenContainer.appendChild(HTML({ tag: 'div', className: 'dt-el-text', text: child.textContent.trim() }));
            }
        });

        details.appendChild(childrenContainer);
        details.appendChild(HTML({ className: 'dt-el-close', children: [TagLogic.renderClose(tagName)] }));

        return details;
    }
};
