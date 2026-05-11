// B"H
/**
 * @file ActionVesselBuilder.js
 * @brief THE BUILDER OF THE INLINE ACTION CHAMBER.
 */

import { HTML } from '../../../../../html-generator.js';

export class ActionVesselBuilder {
    /**
     * B"H - Manifests an interactive Action details box.
     * @param {string} label - The deed being done.
     * @param {string|Object|HTMLElement} content - The result essence (String, JSON HTML config, or real element).
     * @param {boolean} isProcessing - True if still in emanation.
     */
    static build(label, content, isProcessing) {
        // Determine the form of the content
        let contentChildren = [];
        let contentText = "";

        if (content instanceof HTMLElement) {
            contentChildren = [content];
        } else if (typeof content === 'object' && content !== null) {
            contentChildren = [content]; // Treat as JSON HTML blueprint
        } else {
            contentText = content || (isProcessing ? 'Synthesizing response...' : 'Vessel manifested.');
        }

        return HTML({
            tag: 'details',
            className: 'vibe-inline-action',
            open: isProcessing,
            children: [
                {
                    tag: 'summary',
                    children: [
                        { 
                            className: 'status-icon',
                            children: [
                                isProcessing ? { className: 'vibe-spinner' } : { text: '✓' }
                            ]
                        },
                        { 
                            className: 'vibe-action-label' + (isProcessing ? ' pulse-processing' : ''),
                            text: label 
                        }
                    ]
                },
                {
                    className: 'action-content',
                    children: contentChildren,
                    text: contentText
                }
            ]
        });
    }
}