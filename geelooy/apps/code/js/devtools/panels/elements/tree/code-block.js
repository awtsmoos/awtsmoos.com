
// B"H
/**
 * @file code-block.js
 * @brief The Sacred Scroll for highlighted script segments.
 */

import { HTML } from '../../../../../html-generator.js';
import VirtualizedEditor from '/scripts/awtsmoos/coding/pnimi.js';

export const CodeBlockRenderer = {
    render(content, lang) {
        const wrapper = HTML({
            className: 'dt-el-code-block',
            style: { 
                paddingLeft: '20px', 
                margin: '5px 0', 
                borderLeft: '2px solid rgba(255,255,255,0.1)',
                position: 'relative'
            },
            children:[
                {
                    tag: 'textarea',
                    readOnly: true,
                    value: content,
                    spellcheck: false,
                    style: {
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        resize: 'none',
                        color: 'transparent',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        lineHeight: '1.5',
                        padding: '0',
                        margin: '0',
                        display: 'block'
                    }
                }
            ]
        });

        setTimeout(() => {
            const ta = wrapper.querySelector('textarea');
            if (ta) {
                try {
                    const ve = new VirtualizedEditor(ta, lang);
                    const wrap = ve.wrapper;
                    
                    // B"H - Sacred Alignment
                    if (wrap) wrap.style.position = 'relative';
                    
                    ta.style.height = 'auto';
                    const h = ta.scrollHeight;
                    ta.style.height = `${h}px`;
                    if (wrap) wrap.style.height = `${h}px`;

                    ve.update(content);
                    ve.refresh();
                } catch(e) {
                    console.warn("B\"H - Element Highlighting Failed", e);
                }
            }
        }, 50);

        return wrapper;
    }
};
