
// B"H
/**
 * @file ThoughtDOMBuilder.js
 * @brief THE MOLD OF THE INVISIBLE MIND.
 * 
 * CHAPTER IX: SHAPING THE INTELLECT
 * The AI generates reasoning and logic outside of the XML tag boundary. 
 * This Builder takes that parsed textual logic and crafts the perfect physical UI 
 * Dropdown structure via the JSON HTML engine.
 * No crude templates. No arbitrary strings. Only pure JSON architecture!
 */

import { HTML } from '../../../../../html-generator.js';

export const ThoughtDOMBuilder = {
    /**
     * B"H
     * Generates a retractable visual container for the AI's thoughts.
     * @param {string} parsedMarkdownHtml - The HTML payload parsed from markdown logic.
     * @returns {HTMLElement} The complete physical `<details>` dropdown node.
     */
    build(parsedMarkdownHtml) {
        return HTML({
            tag: 'details',
            className: 'vibe-model-thoughts',
            open: true, // Always start expanded to offer immediate intellectual transparency
            style: {
                marginBottom: '12px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,0,255,0.15)',
                borderRadius: '8px',
                padding: '10px 12px',
                boxShadow: 'inset 0 0 10px rgba(255,0,255,0.05)',
                transition: 'all 0.3s ease'
            },
            children:[
                {
                    tag: 'summary',
                    style: {
                        cursor: 'pointer', 
                        color: 'var(--neon-magenta)', 
                        fontWeight: 'bold', 
                        fontSize: '0.9em', 
                        opacity: '0.9', 
                        userSelect: 'none', 
                        outline: 'none', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '8px'
                    },
                    children:[
                        { 
                            tag: 'span', 
                            style: { 
                                display: 'inline-block', 
                                fontSize: '1.2em', 
                                filter: 'drop-shadow(0 0 5px var(--neon-magenta))' 
                            }, 
                            text: '🧠' 
                        },
                        { 
                            tag: 'span', 
                            style: { letterSpacing: '0.5px' }, 
                            text: 'Cognitive Emanation & Reasoning' 
                        }
                    ]
                },
                {
                    className: 'vibe-md-container',
                    style: {
                        fontSize: '0.9em', 
                        lineHeight: '1.6', 
                        opacity: '0.85', 
                        paddingTop: '10px', 
                        marginTop: '8px', 
                        borderTop: '1px dashed rgba(255,0,255,0.2)'
                    },
                    html: parsedMarkdownHtml
                }
            ]
        });
    }
};
