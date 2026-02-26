
// B"H
/**
 * @file log-renderer.js
 * @brief Manages the chronological stream of logs.
 */

import { HTML } from '../../../html-generator.js';
import { ObjectViewer } from './object-viewer.js';
import VirtualizedEditor from '/scripts/awtsmoos/coding/pnimi.js';

export const LogRenderer = {
    attach(container, state) {
        const outputWrap = HTML({
            className: 'dt-console-output',
            style: { 
                flexGrow: '1', 
                overflowY: 'auto', 
                padding: '10px', 
                fontFamily: 'var(--font-code)', 
                fontSize: '0.9em', 
                background: 'var(--color-bg-deep)', 
                wordBreak: 'break-all', 
                width: '100%' 
            }
        });
        
        container.appendChild(outputWrap);

        const printLog = (log) => {
            const children = [];
            
            // Base Style
            let styleObj = { 
                padding: '6px 0', 
                borderBottom: '1px solid rgba(255,255,255,0.05)', 
                display: 'flex', 
                flexWrap: 'wrap', 
                alignItems: 'baseline', 
                gap: '8px', 
                lineHeight: '1.5',
                width: '100%'
            };

            if (log.level === 'input') {
                Object.assign(styleObj, { 
                    color: 'var(--color-text-secondary)', 
                    borderTop: '1px dashed rgba(255,255,255,0.1)',
                    alignItems: 'flex-start'
                });
                
                children.push(HTML({ 
                    tag: 'span', 
                    style: { color: 'var(--color-text-tertiary)', userSelect: 'none', marginRight: '5px', marginTop: '2px' }, 
                    text: '< ' 
                }));

                const codeContent = log.args[0]?.value || "";
                
                // Create a container for the read-only editor
                const editorContainer = HTML({
                    tag: 'div',
                    style: { flexGrow: '1', position: 'relative', minHeight: '20px' },
                    children: [
                        {
                            tag: 'textarea',
                            readOnly: true,
                            value: codeContent,
                            style: {
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                resize: 'none',
                                color: 'transparent', // Transparent for highlighter
                                fontFamily: 'var(--font-code)',
                                fontSize: '14px',
                                overflow: 'hidden',
                                padding: 0,
                                margin: 0
                            }
                        }
                    ]
                });
                
                children.push(editorContainer);

                const row = HTML({ style: styleObj, children });
                outputWrap.appendChild(row);

                // Hydrate Pnimi
                setTimeout(() => {
                    const ta = editorContainer.querySelector('textarea');
                    if (ta) {
                        const lines = codeContent.split('\n').length;
                        const height = lines * 21; // Approx height
                        ta.style.height = `${height}px`;
                        try {
                            const ve = new VirtualizedEditor(ta, 'js');
                            ve.wrapper.style.height = `${height}px`;
                            if (ve.overlay) ve.overlay.style.pointerEvents = 'none';
                        } catch(e) {}
                    }
                }, 0);

            } else {
                // Standard Log
                if (log.level === 'error') {
                    Object.assign(styleObj, { color: 'var(--color-accent-danger)', backgroundColor: 'rgba(247,93,101,0.05)', borderLeft: '3px solid var(--color-accent-danger)', paddingLeft: '8px' });
                } else if (log.level === 'warn') {
                    Object.assign(styleObj, { color: '#ffae57', backgroundColor: 'rgba(255,174,87,0.05)', borderLeft: '3px solid #ffae57', paddingLeft: '8px' });
                } else {
                    styleObj.color = '#a8ff00';
                }

                log.args.forEach(arg => children.push(ObjectViewer.build(arg)));
                outputWrap.appendChild(HTML({ style: styleObj, children }));
            }
            
            requestAnimationFrame(() => outputWrap.scrollTop = outputWrap.scrollHeight);
        };

        // Render History
        if (state.logs && state.logs.length > 0) {
            state.logs.forEach(printLog);
        }

        // Listen for new logs
        state.onLog = printLog;
        
        return printLog;
    }
};
