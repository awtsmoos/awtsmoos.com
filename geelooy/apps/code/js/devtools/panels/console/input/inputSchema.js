
// B"H
/**
 * @file inputSchema.js
 * @brief JSON data for the console input manifestation.
 */

export const CONSOLE_INPUT_SCHEMA = {
    className: 'dt-console-input-area',
    style: { 
        display: 'flex', 
        padding: '10px', 
        borderTop: '1px solid var(--color-border, #333)', 
        background: '#252526', 
        alignItems: 'flex-start', 
        flexShrink: '0', 
        width: '100%',
        minHeight: '40px' 
    },
    children:[
        { 
            tag: 'span', 
            style: { 
                color: 'var(--neon-cyan, #0ff)', 
                fontWeight: 'bold', 
                marginRight: '12px', 
                marginTop: '4px', 
                fontFamily: 'monospace' 
            }, 
            text: '>' 
        },
        { 
            className: 'dt-console-editor-host',
            style: { position: 'relative', flexGrow: '1', display: 'flex', flexDirection: 'column' },
            children:[
                {
                    tag: 'textarea',
                    id: 'dt-console-text-entry',
                    rows: 1,
                    placeholder: 'Execute JavaScript...',
                    spellcheck: false,
                    style: { 
                        width: '100%', 
                        background: 'transparent', 
                        border: 'none', 
                        outline: 'none', 
                        fontFamily: 'monospace', 
                        fontSize: '14px', 
                        resize: 'none', 
                        overflow: 'hidden', 
                        lineHeight: '1.5', 
                        padding: '0', 
                        margin: '0', 
                        display: 'block', 
                        color: 'transparent', 
                        caretColor: 'white'
                    }
                }
            ]
        }
    ]
};
