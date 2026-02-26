
// B"H
/**
 * @file input-log.js
 * @brief Renders the user's past commands with syntax highlighting.
 */

import { HTML } from '../../../../html-generator.js';
import VirtualizedEditor from '/scripts/awtsmoos/coding/pnimi.js';
import { VisibilityObserver } from '../../../common/observer.js';
import { LogStyles } from './styles.js';

export const InputLogRenderer = {
    render(log) {
        const style = { ...LogStyles.base, ...LogStyles.input };
        const codeContent = log.args[0]?.value || "";

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
                        color: 'transparent',
                        fontFamily: 'var(--font-code)',
                        fontSize: '14px',
                        overflow: 'hidden',
                        padding: 0,
                        margin: 0,
                        display: 'block',
                        lineHeight: '1.5'
                    }
                }
            ]
        });

        const row = HTML({
            style: style,
            children: [
                { 
                    tag: 'span', 
                    style: { color: 'var(--color-text-tertiary)', userSelect: 'none', marginRight: '5px', marginTop: '2px' }, 
                    text: '< ' 
                },
                editorContainer
            ]
        });

        // Hydrate Pnimi
        setTimeout(() => {
            const ta = editorContainer.querySelector('textarea');
            if (ta) {
                const lines = codeContent.split('\n').length;
                const height = Math.max(20, lines * 21);
                ta.style.height = `${height}px`;
                
                try {
                    const ve = new VirtualizedEditor(ta, 'js');
                    ve.wrapper.style.height = `${height}px`;
                    if (ve.overlay) ve.overlay.style.pointerEvents = 'none';
                    
                    VisibilityObserver.observe(editorContainer, ve);
                } catch(e) {
                    console.warn("Input Log Highlight Error", e);
                }
            }
        }, 10);

        return row;
    }
};
