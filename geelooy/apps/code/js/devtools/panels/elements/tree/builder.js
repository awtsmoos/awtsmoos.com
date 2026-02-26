
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

        // Special handling for Script/Style content
        if ((tagName === 'script' || tagName === 'style') && node.textContent.trim()) {
            const lang = tagName === 'script' ? 'js' : 'css';
            const codeBlock = CodeBlockRenderer.render(node.textContent.trim(), lang);
            
            return HTML({
                style: { display: 'block', marginBottom: '2px' },
                children: [
                    { tag: 'div', style: { display: 'flex' }, children: openTagElements },
                    codeBlock,
                    { tag: 'div', style: { display: 'flex' }, children: [closeTagConfig] }
                ]
            });
        }

        // Void Elements (Self-closing)
        if (TagLogic.isVoid(tagName)) {
            return HTML({ 
                className: 'dt-el-line', 
                style: { display: 'flex', paddingLeft: '16px', marginBottom: '2px' }, 
                children: openTagElements 
            });
        }
        
        // Empty Elements
        if (node.childNodes.length === 0) {
            return HTML({ 
                className: 'dt-el-line', 
                style: { display: 'flex', paddingLeft: '16px', marginBottom: '2px' }, 
                children: [...openTagElements, closeTagConfig] 
            });
        }

        // Simple Text Children (Inline)
        if (node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE) {
            const rawText = node.childNodes[0].textContent.trim();
            if (rawText.length < 60 && !rawText.includes('\n')) {
                return HTML({
                    className: 'dt-el-line',
                    style: { display: 'flex', paddingLeft: '16px', marginBottom: '2px' },
                    children:[
                        ...openTagElements,
                        { tag: 'span', style: { color: '#d4d4d4', margin: '0 5px' }, text: rawText },
                        closeTagConfig
                    ]
                });
            }
        }

        // Deep Nesting (Recursive Details/Summary)
        const isOpen = TagLogic.isAutoOpen(tagName);
        let isLoaded = false;
        let arrowEl;
        let bodyContainer;

        const toggleDetails = (e) => {
            e.stopPropagation();
            const isHidden = bodyContainer.style.display === 'none';
            bodyContainer.style.display = isHidden ? 'block' : 'none';
            arrowEl.textContent = isHidden ? '▼' : '▶';
            
            if (isHidden && !isLoaded) {
                isLoaded = true;
                Array.from(node.childNodes).forEach(c => { 
                    const cN = this.buildNode(c); 
                    if(cN) bodyContainer.appendChild(cN); 
                });
            }
        };

        const wrapper = HTML({
            style: { display: 'block', marginBottom: '2px', whiteSpace: 'nowrap' },
            children:[
                {
                    tag: 'div',
                    style: { cursor: 'pointer', display: 'flex', alignItems: 'flex-start', userSelect: 'none' },
                    onClick: toggleDetails,
                    children: [ 
                        { 
                            tag: 'span', 
                            text: isOpen ? '▼' : '▶', 
                            style: { fontSize: '0.6em', color: 'gray', marginRight: '6px', width: '10px' }, 
                            ref: el => arrowEl = el 
                        }, 
                        ...openTagElements 
                    ]
                },
                {
                    ref: el => bodyContainer = el,
                    className: 'dt-el-children',
                    style: { 
                        paddingLeft: '12px', 
                        borderLeft: '1px dotted rgba(255, 255, 255, 0.2)', 
                        marginLeft: '5px', 
                        display: isOpen ? 'block' : 'none' 
                    }
                },
                { tag: 'div', style: { paddingLeft: '16px', display: 'flex' }, children: [closeTagConfig] }
            ]
        });

        if (isOpen) {
            isLoaded = true;
            Array.from(node.childNodes).forEach(c => { const cN = this.buildNode(c); if(cN) bodyContainer.appendChild(cN); });
        }

        return wrapper;
    }
};
