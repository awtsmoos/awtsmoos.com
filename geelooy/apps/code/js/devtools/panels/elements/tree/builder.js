
// B"H
/**
 * @file builder.js
 * @brief The Construct of the Tree.
 */

import { HTML } from '../../../../html-generator.js';
import { AttributeRenderer } from './attributes.js';
import { CodeBlockRenderer } from './code-block.js';
import { TagLogic } from './tags.js';

export const DOMTreeBuilder = {
    buildNode(node) {
        if (!node) return null;

        // Text Node
        if (node.nodeType === Node.TEXT_NODE) {
            const txt = node.textContent.trim();
            if (!txt) return null;
            // B"H - If it's a child of a script/style, it will be handled by the parent's recursive call.
            // This standalone render is for root-level text nodes or mixed content.
            return HTML({ 
                className: 'dt-el-text', 
                style: { color: '#d4d4d4', paddingLeft: '16px', whiteSpace: 'pre-wrap' }, 
                text: txt 
            });
        }

        // Comment Node
        if (node.nodeType === Node.COMMENT_NODE) {
            return HTML({ 
                className: 'dt-el-comment', 
                style: { color: '#6A9955', fontStyle: 'italic', paddingLeft: '16px', whiteSpace: 'pre-wrap' }, 
                text: `<!-- ${node.textContent} -->` 
            });
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return null;

        const tagName = node.tagName.toLowerCase();
        const attributesHtml = AttributeRenderer.render(node.attributes);
        const openTagElements = TagLogic.renderOpen(tagName, attributesHtml);
        const closeTagConfig = TagLogic.renderClose(tagName);

        // Void Elements (Self-closing)
        if (TagLogic.isVoid(tagName)) {
            return HTML({ 
                className: 'dt-el-line', 
                children: openTagElements 
            });
        }
        
        // Empty Elements
        if (node.childNodes.length === 0) {
            return HTML({ 
                className: 'dt-el-line', 
                children: [...openTagElements, closeTagConfig] 
            });
        }

        // Simple Text Children (Inline)
        if (node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE) {
            const rawText = node.childNodes[0].textContent.trim();
            if (rawText && rawText.length < 80 && !rawText.includes('\n')) {
                 return HTML({
                    className: 'dt-el-line',
                    children:[
                        ...openTagElements,
                        { tag: 'span', className: 'dt-el-text-inline', text: rawText },
                        closeTagConfig
                    ]
                });
            }
        }

        // --- B"H - THE UNIFIED DEEP NESTING RITUAL ---
        // All non-void, non-empty elements now pass through here.
        const isOpen = TagLogic.isAutoOpen(tagName);
        const hasChildren = node.childNodes.length > 0;
        
        const details = document.createElement('details');
        details.className = 'dt-el-node';
        details.open = isOpen;

        const summary = document.createElement('summary');
        summary.className = 'dt-el-summary';
        
        const summaryContent = HTML({
            tag: 'span',
            className: 'dt-el-tag-line',
            style: { display: 'inline-flex', alignItems: 'baseline' },
            children: openTagElements
        });
        summary.appendChild(summaryContent);
        details.appendChild(summary);

        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'dt-el-children';

        const renderChildren = () => {
            Array.from(node.childNodes).forEach(childNode => {
                let renderedChild;
                if ((tagName === 'script' || tagName === 'style') && childNode.nodeType === Node.TEXT_NODE && childNode.textContent.trim()) {
                    const lang = tagName === 'script' ? 'js' : 'css';
                    renderedChild = CodeBlockRenderer.render(childNode.textContent.trim(), lang);
                } else {
                    renderedChild = this.buildNode(childNode);
                }
                if (renderedChild) childrenContainer.appendChild(renderedChild);
            });
        };

        if (isOpen) {
            renderChildren();
        } else {
            // Lazy load children on open
            details.addEventListener('toggle', () => {
                if (details.open && childrenContainer.children.length === 0) {
                    renderChildren();
                }
            }, { once: true });
        }
        
        details.appendChild(childrenContainer);

        const closeTagEl = HTML({
            className: 'dt-el-close',
            children: [closeTagConfig]
        });
        details.appendChild(closeTagEl);

        return details;
    }
};
