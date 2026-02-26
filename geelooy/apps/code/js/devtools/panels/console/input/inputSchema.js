
// B"H
/**
 * @file inputSchema.js
 */

export const CONSOLE_INPUT_SCHEMA = {
    className: 'dt-console-input-area',
    style: { 
        display: 'flex', 
        flexDirection: 'column',
        padding: '10px', 
        borderTop: '1px solid var(--color-border)', 
        background: 'var(--color-bg-secondary)', 
        width: '100%',
        gap: '8px'
    },
    children:[
        {
            style: { display: 'flex', width: '100%', gap: '8px' },
            children: [
                { tag: 'span', style: { color: 'var(--neon-cyan)', fontWeight: 'bold', marginTop: '4px' }, text: '>' },
                { 
                    className: 'dt-console-editor-host',
                    style: { position: 'relative', flexGrow: '1' },
                    children:[
                        {
                            tag: 'textarea',
                            id: 'dt-console-text-entry',
                            rows: 1,
                            placeholder: 'Execute JavaScript...',
                            spellcheck: false,
                            style: { width: '100%', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'monospace', fontSize: '14px', resize: 'none', overflow: 'hidden', lineHeight: '1.5', padding: '0', margin: '0', color: 'transparent', caretColor: 'white' }
                        }
                    ]
                }
            ]
        },
        {
            className: 'dt-console-control-bar',
            style: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
            children: [
                { tag: 'button', id: 'dt-btn-tab', className: 'secondary-btn', style: { minHeight: '30px', padding: '0 10px', fontSize: '0.8em' }, text: 'Tab ⇥' },
                { tag: 'button', id: 'dt-btn-up', className: 'secondary-btn', style: { minHeight: '30px', padding: '0 10px' }, text: '▲' },
                { tag: 'button', id: 'dt-btn-send', className: 'primary-btn', style: { minHeight: '30px', padding: '0 15px' }, text: '➤' }
            ]
        }
    ]
};
