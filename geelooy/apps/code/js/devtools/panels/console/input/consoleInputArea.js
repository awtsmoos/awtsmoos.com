
// B"H
/**
 * @file consoleInputArea.js
 * @brief JSON data blueprint for the console input.
 */

export const ConsoleInputSchema = {
    className: 'dt-console-input-area',
    style: { 
        display: 'flex', 
        padding: '10px', 
        borderTop: '1px solid var(--color-border)', 
        background: 'var(--color-bg-secondary)', 
        alignItems: 'flex-start', 
        flexShrink: '0', 
        width: '100%',
        minHeight: '40px' 
    },
    children:[
        { 
            tag: 'span', 
            style: { 
                color: 'var(--neon-cyan)', 
                fontWeight: 'bold', 
                marginRight: '12px', 
                marginTop: '4px', 
                fontFamily: 'var(--font-code)' 
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
                    placeholder: 'Execute JavaScript... (Shift+Enter for multi-line)',
                    spellcheck: false,
                    style: { 
                        width: '100%', 
                        background: 'transparent', 
                        border: 'none', 
                        outline: 'none', 
                        fontFamily: 'var(--font-code)', 
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
