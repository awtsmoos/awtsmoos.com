
// B"H
/**
 * @file inputSchema.js
 * @brief Blueprint for the high-performance console input.
 */

export const CONSOLE_INPUT_SCHEMA = {
    className: 'dt-console-input-area',
    children:[
        {
            className: 'dt-console-prompt-row',
            children: [
                { tag: 'span', className: 'dt-console-symbol', text: '>' },
                { 
                    className: 'dt-console-editor-wrap',
                    children:[
                        {
                            tag: 'textarea',
                            id: 'dt-console-text-entry',
                            rows: 1,
                            placeholder: 'Execute JavaScript...',
                            spellcheck: false
                        }
                    ]
                }
            ]
        },
        {
            className: 'dt-console-control-bar',
            children: [
                { tag: 'button', id: 'dt-btn-tab', className: 'secondary-btn', style: { minHeight: '28px', padding: '0 12px', fontSize: '11px' }, text: 'Autocomplete ⇥' },
                { tag: 'button', id: 'dt-btn-up', className: 'secondary-btn', style: { minHeight: '28px', padding: '0 10px' }, text: '▲' },
                { tag: 'button', id: 'dt-btn-send', className: 'primary-btn', style: { minHeight: '28px', padding: '0 20px', background: 'linear-gradient(45deg, var(--neon-cyan), var(--neon-magenta))', border: 'none', borderRadius: '4px', color: '#000', fontWeight: 'bold' }, text: 'RUN' }
            ]
        }
    ]
};
