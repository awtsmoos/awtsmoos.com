
// B"H
/**
 * @file ModelGrid.js
 * @brief The Structured Hierarchy of Vessels.
 */

import { HTML } from '../../../../../html-generator.js';
import { PickerStyles as S } from './PickerStyles.js';
import { AgentCapabilities } from '../../../../agent/logic/AgentCapabilities.js';
import { ModelCard } from './ModelCard.js';

export const ModelGrid = {
    /**
     * B"H
     * Groups and renders models, forcing Free categories to the top.
     */
    render(models, onSelect) {
        if (!models || models.length === 0) return null;

        const categories = {};

        models.forEach(m => {
            const cat = AgentCapabilities.getCategory(m);
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(m);
        });

        // B"H - THE SORTING OF THE REALMS
        // We sort the keys so that those starting with "Free" appear first.
        const sortedCategoryKeys = Object.keys(categories).sort((a, b) => {
            const aFree = a.startsWith('Free');
            const bFree = b.startsWith('Free');
            if (aFree && !bFree) return -1;
            if (!aFree && bFree) return 1;
            return a.localeCompare(b);
        });

        return HTML({
            style: { marginTop: '20px', borderTop: '1px solid #222', paddingTop: '20px' },
            children: [
                { tag: 'span', style: { ...S.sectionTitle, color: 'var(--neon-cyan)' }, text: 'Select Manifestation Vessel' },
                ...sortedCategoryKeys.map(title => 
                    this._renderGroup(title, categories[title], onSelect)
                )
            ]
        });
    },

    _renderGroup(title, list, onSelect) {
        const isFree = title.startsWith('Free');
        const color = isFree ? 'var(--neon-lime)' : 'var(--neon-magenta)';

        return {
            style: { 
                marginBottom: '30px',
                padding: isFree ? '15px' : '0',
                background: isFree ? 'rgba(168, 255, 0, 0.02)' : 'none',
                borderRadius: '12px',
                border: isFree ? '1px solid rgba(168, 255, 0, 0.1)' : 'none'
            },
            children: [
                { 
                    tag: 'div', 
                    style: { 
                        fontSize: '11px', color: color, marginBottom: '15px', 
                        fontWeight: 'bold', letterSpacing: '1px', display: 'flex', 
                        alignItems: 'center', gap: '8px' 
                    }, 
                    children: [
                        { tag: 'span', text: isFree ? '💎' : '💰' },
                        { tag: 'span', text: title.toUpperCase() }
                    ]
                },
                {
                    style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
                    children: list.map(m => ModelCard.render(m, onSelect))
                }
            ]
        };
    }
};
