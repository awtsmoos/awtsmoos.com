
// B"H
/**
 * @file ModelCard.js
 * @brief The Visual Blueprint of an AI Oracle.
 */

import { HTML } from '../../../../../html-generator.js';
import { ModelManager } from '../../../../model-manager.js';
import { AgentCapabilities } from '../../../../agent/logic/AgentCapabilities.js';

export const ModelCard = {
    render(m, onSelect) {
        const isActive = m.id === ModelManager.currentModel;
        const hasTools = AgentCapabilities.supportsTools(m);
        const isReasoning = AgentCapabilities.isReasoning(m);

        return HTML({
            className: 'vibe-model-card-item',
            style: {
                padding: '12px', borderRadius: '10px', cursor: 'pointer',
                border: `1px solid ${isActive ? 'var(--neon-cyan)' : '#1a1d23'}`,
                background: isActive ? 'rgba(0, 246, 255, 0.05)' : 'rgba(255,255,255,0.01)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex', flexDirection: 'column', gap: '6px',
                position: 'relative', overflow: 'hidden'
            },
            onMouseEnter: (e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = isActive ? 'var(--neon-cyan)' : '#333';
            },
            onMouseLeave: (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = isActive ? 'var(--neon-cyan)' : '#1a1d23';
            },
            onClick: () => onSelect(m.id),
            children: [
                // Top Row: Name & Provider
                {
                    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
                    children: [
                        { style: { fontWeight: 'bold', fontSize: '13px', color: isActive ? 'var(--neon-cyan)' : '#fff' }, text: m.displayName },
                        { tag: 'span', style: { fontSize: '9px', opacity: 0.4 }, text: m.provider.toUpperCase() }
                    ]
                },
                // Middle Row: Specs
                {
                    style: { display: 'flex', gap: '10px', fontSize: '10px', opacity: 0.6 },
                    children: [
                        { text: `Context: ${this._fmt(m.context_length)}` },
                        m.costPrompt ? { text: `$${Number(m.costPrompt * 1000000).toFixed(2)}/1M tokens` } : null
                    ]
                },
                // Bottom Row: Capability Badges
                {
                    style: { display: 'flex', gap: '5px', marginTop: '4px' },
                    children: [
                        hasTools ? this._badge('TOOLS', 'var(--neon-lime)') : this._badge('NO TOOLS', '#555'),
                        isReasoning ? this._badge('THINK', 'var(--neon-magenta)') : null
                    ]
                }
            ]
        });
    },

    _badge(label, color) {
        return {
            tag: 'span',
            style: { 
                fontSize: '8px', fontWeight: 'bold', padding: '1px 5px', 
                borderRadius: '3px', border: `1px solid ${color}`, color: color,
                background: `${color}11`
            },
            text: label
        };
    },

    _fmt(n) {
        if (!n) return '?';
        if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n/1000).toFixed(0) + 'k';
        return n;
    }
};
