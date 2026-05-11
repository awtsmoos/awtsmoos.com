
// B"H
/**
 * @file InlineActionBuilder.js
 */

import { HTML } from '../../../../html-generator.js';

export const InlineActionBuilder = {
    build(label, content, isRunning) {
        return HTML({
            tag: 'details',
            className: 'vibe-inline-action',
            attributes: { open: isRunning ? 'true' : 'false' },
            style: {
                background: 'rgba(0, 246, 255, 0.05)',
                border: '1px solid rgba(0, 246, 255, 0.3)',
                borderRadius: '6px',
                marginBottom: '10px',
                width: '100%',
                overflow: 'hidden'
            },
            children: [
                {
                    tag: 'summary',
                    style: { padding: '10px 15px', cursor: 'pointer', fontWeight: 'bold', color: 'var(--neon-cyan)', userSelect: 'none', outline: 'none', display: 'flex', alignItems: 'center', gap: '10px' },
                    children: [
                        { tag: 'span', className: 'action-spin-holder' },
                        { tag: 'span', className: 'vibe-action-label', text: label }
                    ]
                },
                {
                    className: 'action-content',
                    style: { maxHeight: '300px', overflowY: 'auto', padding: '0 15px 15px 15px', fontSize: '0.85em', color: '#fff', fontFamily: 'var(--font-code)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' },
                    text: content || "Thinking..."
                }
            ]
        });
    }
};
