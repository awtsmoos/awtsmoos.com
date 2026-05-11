
// B"H
/**
 * @file ErrorRenderer.js
 * @brief The Painter of the Broken Vessel.
 */

import { HTML } from '../../../../html-generator.js';

export const ErrorRenderer = {
    /**
     * B"H
     * Manifests an error card with actionable advice.
     */
    render(layer, errorInfo) {
        if (!errorInfo) return;

        layer.innerHTML = '';
        const card = HTML({
            className: 'vibe-error-card',
            style: {
                background: 'rgba(10, 10, 15, 0.95)',
                border: '1px solid var(--color-accent-danger)',
                borderLeft: '5px solid var(--color-accent-danger)',
                borderRadius: '8px',
                padding: '20px',
                color: '#fff',
                fontFamily: 'var(--font-ui)',
                marginTop: '10px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 15px rgba(247, 93, 101, 0.2)',
                backdropFilter: 'blur(10px)',
                pointerEvents: 'auto' // B"H - Crucial for clicking details
            },
            children: [
                { 
                    tag: 'h4', 
                    style: { margin: '0 0 12px 0', color: 'var(--color-accent-danger)', fontSize: '16px', letterSpacing: '1px' }, 
                    text: `⚠️ ${errorInfo.title || 'Dimensional Divergence'}` 
                },
                { 
                    className: 'vibe-error-main-msg',
                    style: { 
                        margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.6', 
                        color: 'var(--color-text-primary)', background: 'rgba(255,255,255,0.03)',
                        padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)'
                    }, 
                    text: errorInfo.message
                },
                { 
                    style: { fontSize: '12px', fontWeight: 'bold', color: 'var(--neon-cyan)', marginBottom: '15px' }, 
                    text: `Ritual Recommendation: ${errorInfo.action}` 
                },
                errorInfo.link ? {
                    tag: 'a', href: errorInfo.link, target: '_blank',
                    style: { 
                        display: 'inline-block', padding: '8px 16px', background: 'var(--color-accent-danger)', 
                        color: '#000', borderRadius: '4px', textDecoration: 'none', 
                        fontSize: '12px', fontWeight: 'bold', boxShadow: '0 0 10px var(--glow-danger)' 
                    },
                    text: 'Resolve Dimension Conflict'
                } : null,
                {
                    tag: 'details',
                    style: { marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', cursor: 'pointer' },
                    children: [
                        { tag: 'summary', style: { fontSize: '10px', opacity: 0.5, outline: 'none' }, text: 'Technical Metadata (Raw Manifestation)' },
                        { tag: 'pre', style: { fontSize: '11px', opacity: 0.8, whiteSpace: 'pre-wrap', overflowX: 'auto', background: '#000', padding: '12px', marginTop: '10px', borderRadius: '4px', color: 'var(--neon-magenta)', border: '1px solid #222' }, text: JSON.stringify(errorInfo.raw, null, 2) }
                    ]
                }
            ]
        });

        layer.appendChild(card);
    }
};
