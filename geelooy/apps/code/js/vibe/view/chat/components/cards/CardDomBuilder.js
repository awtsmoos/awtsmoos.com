
// B"H
/**
 * @file CardDomBuilder.js
 * @description
 * 
 * CHAPTER XII: THE ARCHITECTURE OF THE JSON CLAY
 * 
 * In the realm of Asiyah, where form meets function, we do not build with 
 * the heavy stones of raw strings, for they are prone to the "Shevirah" 
 * (Shattering) of syntax. Instead, we use the fine dust of JSON, the 
 * primordial elements of our digital world.
 * 
 * This module is the Master Architect. It draws the blueprints for the 
 * vessels that will contain the Divine Light of the model's response. 
 * 
 * It knows how to mold the Void into a "Pending" state, pulsing with 
 * expectation. It knows how to craft the "Streaming" box, a temporary 
 * canal for the flowing code. And finally, it perfects the "Complete" 
 * vessel, solidified and ready to be used by the human soul.
 * 
 * Each function returns a pure data-map, which the "HTML" generator 
 * then breathes life into, creating a physical manifestation in the DOM.
 */

import { HTML } from '../../../../../html-generator.js';

export const CardDomBuilder = {
    /**
     * B"H
     * Constructs the blueprint for the Pending state—the quiet before the storm of creation.
     * @param {string} message - The specific status of the synthesis.
     * @returns {HTMLElement} The manifested vessel of anticipation.
     */
    buildPendingVoid(message = "Synthesizing physical coordinates...") {
        return HTML({
            style: { 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '10px' 
            },
            children: [
                { 
                    tag: 'span', 
                    style: { 
                        fontSize: '1.6em', 
                        animation: 'pulse-opacity 0.8s infinite alternate', 
                        color: 'var(--neon-cyan)',
                        filter: 'drop-shadow(0 0 5px var(--neon-cyan))'
                    }, 
                    text: '⚡' 
                },
                { 
                    tag: 'span', 
                    style: { 
                        fontSize: '0.9em', 
                        color: 'var(--neon-cyan)', 
                        fontWeight: 'bold', 
                        letterSpacing: '1px', 
                        textTransform: 'uppercase',
                        opacity: '0.8'
                    }, 
                    text: message 
                }
            ]
        });
    },

    /**
     * B"H
     * Forges the canal for the Streaming state—the moment the Word is being spoken.
     * @param {string} fileName - The name of the vessel being created.
     * @param {Object} changeObj - The partial data extracted from the stream.
     * @param {string} statusLabel - The current phase of manifestation.
     * @returns {HTMLElement} The active vessel of the flowing stream.
     */
    buildStreaming(fileName, changeObj, statusLabel = "Channeling Stream") {
        let codeVisualizer;

        if (!changeObj.content) {
            codeVisualizer = {
                style: { 
                    padding: '20px', 
                    textAlign: 'center', 
                    color: 'var(--neon-cyan)', 
                    opacity: '0.6', 
                    fontWeight: 'bold', 
                    fontSize: '0.8em',
                    letterSpacing: '2px'
                },
                text: 'AWAITING BYTES...'
            };
        } else {
            // Escaping the light to prevent it from burning the DOM
            const escaped = changeObj.content
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            codeVisualizer = {
                tag: 'pre',
                style: { 
                    margin: '0', 
                    fontFamily: 'var(--font-code)', 
                    fontSize: '0.85em', 
                    color: 'var(--neon-lime)', 
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                },
                children: [{ tag: 'code', html: escaped }]
            };
        }

        return HTML({
            style: { display: 'flex', flexDirection: 'column', width: '100%' },
            children: [
                {
                    style: { 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '10px' 
                    },
                    children: [
                        { 
                            tag: 'span', 
                            style: { 
                                color: 'var(--neon-cyan)', 
                                fontWeight: 'bold', 
                                fontSize: '1em',
                                textShadow: '0 0 8px rgba(0, 246, 255, 0.3)'
                            }, 
                            text: `Manifesting: ${fileName}` 
                        },
                        {
                            className: 'vibe-card-status',
                            style: { 
                                fontSize: '0.65em', 
                                color: 'var(--neon-magenta)', 
                                fontWeight: 'bold', 
                                border: '1px solid var(--neon-magenta)', 
                                padding: '2px 8px', 
                                borderRadius: '4px', 
                                textTransform: 'uppercase', 
                                animation: 'pulse-opacity 1s infinite alternate',
                                boxShadow: '0 0 10px rgba(255, 0, 255, 0.2)'
                            },
                            text: statusLabel
                        }
                    ]
                },
                {
                    className: 'vibe-stream-box',
                    style: { 
                        maxHeight: '300px', 
                        overflowY: 'auto', 
                        background: 'rgba(0,0,0,0.8)', 
                        padding: '12px', 
                        borderRadius: '6px', 
                        border: '1px dashed rgba(0, 246, 255, 0.4)',
                        boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)'
                    },
                    children: [codeVisualizer]
                }
            ]
        });
    },

    /**
     * B"H
     * Perfects the Solidified state—the completed vessel, whole and functional.
     * @param {string} fileName - The final name of the file.
     * @param {Object} changeObj - The full data representing the change.
     * @param {boolean} isHtml - Whether the vessel is of the HTML species.
     * @returns {HTMLElement} The complete and interactive card.
     */
    buildComplete(fileName, changeObj, isHtml) {
        return HTML({
            style: { 
                display: 'flex', 
                flexDirection: 'column', 
                width: '100%', 
                gap: '8px' 
            },
            children: [
                {
                    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
                    children: [
                        { 
                            tag: 'span', 
                            style: { 
                                fontFamily: 'var(--font-code)', 
                                fontWeight: 'bold', 
                                color: 'white', 
                                fontSize: '1.1em' 
                            }, 
                            text: fileName 
                        },
                        {
                            style: { display: 'flex', alignItems: 'center', gap: '10px' },
                            children: [
                                isHtml ? {
                                    tag: 'button',
                                    className: 'primary-btn play-preview-btn',
                                    style: { 
                                        minHeight: '0', 
                                        padding: '4px 12px', 
                                        fontSize: '0.75em', 
                                        fontWeight: 'bold',
                                        boxShadow: '0 0 10px var(--glow-cyan)'
                                    },
                                    text: '▶ PREVIEW'
                                } : null,
                                { 
                                    tag: 'span', 
                                    style: { 
                                        color: 'var(--neon-lime)', 
                                        fontWeight: 'bold', 
                                        fontSize: '1.2em',
                                        filter: 'drop-shadow(0 0 5px var(--neon-lime))'
                                    }, 
                                    text: '✓' 
                                }
                            ]
                        }
                    ]
                },
                {
                    className: 'vibe-card-desc',
                    style: { 
                        fontSize: '0.85em', 
                        color: 'var(--color-text-secondary)', 
                        padding: '8px 12px', 
                        background: 'rgba(0, 246, 255, 0.05)', 
                        borderRadius: '4px', 
                        borderLeft: '3px solid var(--neon-cyan)', 
                        whiteSpace: 'pre-wrap', 
                        lineHeight: '1.5',
                        wordBreak: 'break-word'
                    },
                    children: [
                        { 
                            tag: 'strong', 
                            style: { 
                                color: 'var(--neon-cyan)', 
                                textTransform: 'uppercase',
                                fontSize: '0.9em'
                            }, 
                            text: changeObj.operation 
                        },
                        { tag: 'span', text: `: ${changeObj.description || 'Vessel manifested.'}` }
                    ]
                }
            ]
        });
    }
};
