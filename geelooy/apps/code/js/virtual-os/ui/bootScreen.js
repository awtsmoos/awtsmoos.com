
// B"H
/**
 * @file bootScreen.js
 * @description
 * Immediate visible proof that the Virtual OS renderer is alive.
 */

import { HTML } from '../../html-generator.js';

/**
 * @function renderBootScreen
 * @param {HTMLElement} container Virtual OS wrapper.
 * @param {string} message Diagnostic message.
 * @returns {void}
 */
export function renderBootScreen(container, message) {
    container.replaceChildren(HTML({
        tag: 'div',
        className: 'virtual-os-root',
        style: {
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '420px',
            background: '#070b12',
            color: '#00f6ff',
            display: 'grid',
            placeItems: 'center',
            borderTop: '1px solid rgba(0,246,255,.4)'
        },
        children: [{
            tag: 'div',
            style: {
                padding: '18px',
                border: '1px solid rgba(0,246,255,.5)',
                borderRadius: '10px',
                background: 'rgba(0,0,0,.65)',
                fontFamily: 'var(--font-code, monospace)'
            },
            children: [
                { tag: 'div', text: 'B"H — Virtual OS', style: { fontWeight: '800', marginBottom: '8px' } },
                { tag: 'div', text: message }
            ]
        }]
    }));
}
