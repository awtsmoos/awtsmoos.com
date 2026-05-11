
// B"H
/**
 * @file LoadingVessel.js
 * @brief THE PULSE OF ANTICIPATION.
 */

import { HTML } from '../../../../../html-generator.js';

/**
 * @class LoadingVessel
 * @description Renders a persistent loading state.
 */
export class LoadingVessel {
    /**
     * B"H - Creates a loading message node.
     * @param {string} status - The current phase.
     * @returns {HTMLElement}
     */
    static build(status) {
        return HTML({
            className: 'loading-manifestation',
            style: {
                display: 'flex',
                gap: '12px',
                padding: '10px',
                alignItems: 'center',
                justifyContent: 'flex-start',
                animation: 'pulse-opacity 1s infinite alternate'
            },
            children: [
                { className: 'vibe-spinner', style: { width: '20px', height: '20px', borderWidth: '2px' } },
                {
                    className: 'loading-status-text',
                    style: {
                        color: 'var(--neon-cyan)',
                        fontSize: '0.9em',
                        fontWeight: 'bold',
                        letterSpacing: '1px'
                    },
                    text: status || 'Illuminating Dimensions...'
                }
            ]
        });
    }
}
