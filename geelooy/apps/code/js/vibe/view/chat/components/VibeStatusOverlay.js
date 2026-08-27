
// B"H
/**
 * @file VibeStatusOverlay.js
 * @brief THE RADIANT BAR OF CURRENT CAPACITY.
 */

import { ModelManager } from '../../../model-manager.js';
import { ModelPickerModal } from './ModelPickerModal.js';
import { AutoModeToggle } from './AutoModeToggle.js';
import { HTML } from '../../../../html-generator.js';

export const VibeStatusOverlay = {
    /**
     * B"H
     * Visual status header including current model and autonomous toggles.
     */
    build(tab, controller) {
        const sess = tab.vibeSession;
        if (!sess.viewState) sess.viewState = { autoMode: true };
        
        const tokLabel = (sess.resourceStats && sess.resourceStats.tokens) ? sess.resourceStats.tokens : "--";
        const activeModel = ModelManager.getActiveModel();
        const activeKey = ModelManager.getActiveKeyObject();

        return {
            style: { 
                display: 'flex', gap: '15px', alignItems: 'center', margin: '5px auto 15px auto', 
                background: 'rgba(10,12,18,0.95)', padding: '10px 20px', borderRadius: '10px',
                border: '1px solid rgba(0, 246, 255, 0.4)', width: 'fit-content', pointerEvents: 'auto'
            },
            children: [
                // Oracle Selector
                {
                    style: { cursor: 'pointer', display: 'flex', flexDirection: 'column' },
                    onClick: () => ModelPickerModal.show(tab, controller),
                    children: [
                        { style: { fontSize: '11px', fontWeight: 'bold', color: 'var(--neon-cyan)' }, text: activeModel ? activeModel.displayName : "No model chose." },
                        { style: { fontSize: '9px', opacity: 0.5 }, text: activeKey ? activeKey.label : "Portal closed." }
                    ]
                },
                // Recursive Logic Toggle
                AutoModeToggle.render(tab, controller),
                // Weight measure
                {
                    style: { display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid #333', paddingLeft: '12px' },
                    children: [
                        { tag: 'span', style: { color: 'var(--neon-lime)' }, text: '◈' },
                        { style: { fontFamily: 'var(--font-code)', fontSize: '11px' }, text: tokLabel + ' TOKENS' }
                    ]
                }
            ]
        };
    }
};
