
// B"H
/**
 * @file dom-tree.js
 * @brief Transmutes live Browser Elements into simulated Inspector objects with Syntax Highlighting.
 */

import { HTML } from '../../../html-generator.js';
import VirtualizedEditor from '/scripts/awtsmoos/coding/pnimi.js';

export const DOMTreeBuilder = {
    buildNode(node) {
        if (!node) return null;

        if (node.nodeType === Node.TEXT_NODE) {
            const txt = node.textContent.trim();
            if (!txt) return null;
            return HTML({ className: 'dt-el-text', style: { color: '#d4d4d4', paddingLeft: '16px', whiteSpace: 'pre-wrap' }, text: txt });
        }

        if (node.nodeType === Node.COMMENT_NODE) {
            return HTML({ className: 'dt-el-comment', style: { color: '#6A9955', fontStyle: 'italic', paddingLeft: '16px', whiteSpace: 'pre-wrap' }, text: `<!-- ${node.textContent} -->` });
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return null;

        const tagName = node.tagName.toLowerCase();
        
        // Assemble Attributes
        const attrChildren =[];
        for (const attr of node.attributes) {
            attrChildren.push({ tag: 'span', style: { color: '#9cdcfe', marginLeft: '6px' }, text: attr.name });
            attrChildren.push({ tag: 'span', text: '="' });
            attrChildren.push({ tag: 'span', style: { color: '#ce9178' }, text: attr.value });
            attrChildren.push({ tag: 'span', text: '"' });
        }

        const openTagElements =[
            { tag: 'span', style: { color: '#569cd6', fontWeight: 'bold' }, text: `<${tagName}` },
            ...attrChildren,
            { tag: 'span', style: { color: '#569cd6', fontWeight: 'bold' }, text: `>` }
        ];

        const closeTagConfig = { tag: 'span', style: { color: '#569cd6', fontWeight: 'bold' }, text: `</${tagName}>` };

        // Handle Script/Style Content with Highlighting
        if (tagName === 'script' || tagName === 'style') {
            const content = node.textContent.trim();
            if (content) {
                const lang = tagName === 'script' ? 'js' : 'css';
                
                // Create container for the editor
                const editorContainer = HTML({
                    tag: 'div',
                    className: 'dt-el-code-block',
                    style: { paddingLeft: '20px', margin: '5px 0', borderLeft: '2px solid rgba(255,255,255,0.1)' },
                    children: [
                        {
                            tag: 'textarea',
                            readOnly: true,
                            value: content,
                            style: {
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                resize: 'none',
                                color: 'transparent',
                                fontFamily: 'var(--font-code)',
                                fontSize: '13px',
                                overflow: 'hidden',
                                padding: 0,
                                margin: 0,
                                whiteSpace: 'pre'
                            }
                        }
                    ]
                });

                // Hydrate
                setTimeout(() => {
                    const ta = editorContainer.querySelector('textarea');
                    if(ta) {
                        const lines = content.split('\n').length;
                        const height = Math.min(lines * 20, 400); // Cap height
                        ta.style.height = `${height}px`;
                        if(lines > 20) ta.style.overflow = 'auto';

                        try {
                            const ve = new VirtualizedEditor(ta, lang);
                            ve.wrapper.style.height = `${height}px`;
                            if(ve.overlay) ve.overlay.style.pointerEvents = 'none';
                        } catch(e) {}
                    }
                }, 0);

                const wrapper = HTML({
                    style: { display: 'block', marginBottom: '2px' },
                    children: [
                        { tag: 'div', style: { display: 'flex' }, children: openTagElements },
                        editorContainer,
                        { tag: 'div', style: { display: 'flex' }, children: [closeTagConfig] }
                    ]
                });
                return wrapper;
            }
        }

        const voidElements =['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
        if (voidElements.includes(tagName)) {
            return HTML({ className: 'dt-el-line', style: { display: 'flex', paddingLeft: '16px', marginBottom: '2px' }, children: openTagElements });
        }
        
        if (node.childNodes.length === 0) {
            return HTML({ className: 'dt-el-line', style: { display: 'flex', paddingLeft: '16px', marginBottom: '2px' }, children: [...openTagElements, closeTagConfig] });
        }

        // Simple Text Child
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

        // Nested Children
        const isOpen = ['html', 'body', 'head', 'div', 'main', 'section'].includes(tagName);
        
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
                        { tag: 'span', text: isOpen ? '▼' : '▶', style: { fontSize: '0.6em', color: 'gray', marginRight: '6px', width: '10px' }, ref: el => arrowEl = el }, 
                        ...openTagElements 
                    ]
                },
                {
                    ref: el => bodyContainer = el,
                    className: 'dt-el-children',
                    style: { paddingLeft: '12px', borderLeft: '1px dotted rgba(255, 255, 255, 0.2)', marginLeft: '5px', display: isOpen ? 'block' : 'none' }
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
