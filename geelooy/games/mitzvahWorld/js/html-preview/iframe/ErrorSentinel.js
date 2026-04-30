
// B"H
/**
 * @file ErrorSentinel.js
 * @brief The Physician of the Preview.
 * 
 * CHAPTER III: THE COMPASSION FOR THE SHATTERED
 * When a world fails to manifest, we do not simply show a void. 
 * We reveal the source of the fracture. This sentinel renders a 
 * resilient visual diagnostic when the physical document cannot be written.
 */

import { HTML } from '../../../html-generator.js';

export const ErrorSentinel = {
    /**
     * B"H
     * Renders a resilient diagnostic fallback into the iframe.
     */
    render(iframe, msg) {
        const d = iframe.contentDocument || iframe.contentWindow.document;
        d.open(); 
        
        // We build the error UI as a data-blueprint for absolute safety
        const errorUI = HTML({
            tag: 'body',
            style: { 
                background: '#050505', color: '#f75d65', padding: '40px', 
                fontFamily: 'monospace', lineHeight: '1.8', border: '5px solid #f75d65',
                height: '100vh', margin: '0', boxSizing: 'border-box'
            },
            children: [
                { tag: 'h2', style: { borderBottom: '2px solid #f75d65', paddingBottom: '15px' }, text: 'B"H - DIMENSIONAL SHIFT INTERRUPTED' },
                { tag: 'p', style: { fontWeight: 'bold', fontSize: '1.2em' }, text: 'The creative word encountered a hurdle:' },
                { 
                    tag: 'div', 
                    style: { background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', color: '#fff' }, 
                    text: msg 
                },
                { tag: 'p', style: { marginTop: '30px', opacity: '0.8' }, text: 'P.S. Check the Editor Console for deep-level spectral logs.' }
            ]
        });

        d.write(errorUI.outerHTML); 
        d.close();
    }
};
