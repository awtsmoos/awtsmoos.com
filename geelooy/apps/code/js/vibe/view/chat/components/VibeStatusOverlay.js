
/**
 * @file VibeStatusOverlay.js
 * @brief The Pulsing Nerve Center of the Chat Presence.
 * 
 * CHAPTER XXXI: THE DIAL OF DIMENSIONS
 * 
 * "And he saw, and behold, a ladder set up on the earth, and the top of it 
 * reached to heaven." 
 * 
 * Why should the user travel to the distant Dashboard just to change 
 * the Oracle's voice? This module manifests a 'Status Aura' that is both 
 * a display and a controller. It features a stylized selection ritual 
 * for the Model and a 'Tzimtzum' (Contraction) button to minimize 
 * the entire overlay, reflecting the infinite adaptability of the soul.
 */

import { HTML } from '../../../../html-generator.js';
import { ModelManager } from '../../../model-manager.js';

export const VibeStatusOverlay = {
    /**
     * B"H
     * Constructs the interactive status component.
     * 
     * @param {Object} tab - The current session context.
     * @param {Object} controller - The Vibe controller for re-rendering.
     * @returns {Object} The JSON UI blueprint.
     */
    build(tab, controller) {
        const sess = tab.vibeSession;
        const isMinimized = !!sess.viewState?.isStatusMinimized;
        const tokenCount = sess.resourceStats?.tokens || "--";
        
        // 1. THE MINIMIZED SEED (A single glowing dot)
        if (isMinimized) {
            return {
                className: 'vibe-status-minimized',
                title: `Model: ${ModelManager.currentModel} | Click to Expand`,
                style: {
                    position: 'absolute', top: '10px', right: '20px',
                    width: '30px', height: '30px', borderRadius: '50%',
                    background: 'rgba(0, 246, 255, 0.1)', border: '1px solid var(--neon-cyan)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', zIndex: '1000', pointerEvents: 'auto',
                    boxShadow: '0 0 10px var(--glow-cyan)', animation: 'pulse-glow 2s infinite'
                },
                onClick: (e) => {
                    e.stopPropagation();
                    sess.viewState.isStatusMinimized = false;
                    controller.refreshView(tab);
                },
                children: [{ tag: 'span', style: { color: 'var(--neon-cyan)', fontSize: '14px' }, text: '◈' }]
            };
        }

        // 2. THE EXPANDED MANIFESTATION (Detailed and Interactive)
        const modelOptions = ModelManager.availableModels.map(m => ({
            tag: 'option',
            value: m.id,
            selected: m.id === ModelManager.currentModel,
            text: m.displayName || m.id
        }));

        return {
            className: 'vibe-status-aura-expanded',
            style: {
                display: 'flex', flexDirection: 'column', gap: '8px',
                padding: '10px 15px', background: 'rgba(10, 12, 20, 0.9)',
                borderRadius: '12px', border: '1px solid rgba(0, 246, 255, 0.3)',
                margin: '10px auto', width: 'fit-content', pointerEvents: 'auto',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)', position: 'relative'
            },
            children:[
                // The Tzimtzum (Minimize) Toggle
                {
                    tag: 'button',
                    title: 'Contract UI',
                    style: {
                        position: 'absolute', top: '-8px', right: '-8px',
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                        color: 'var(--color-text-tertiary)', fontSize: '16px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                    },
                    onClick: (e) => {
                        e.stopPropagation();
                        sess.viewState.isStatusMinimized = true;
                        controller.refreshView(tab);
                    },
                    text: '−'
                },

                // The Selection and Info Row
                {
                    style: { display: 'flex', alignItems: 'center', gap: '20px' },
                    children: [
                        // Model Switcher
                        {
                            style: { display: 'flex', alignItems: 'center', gap: '8px' },
                            children: [
                                { tag: 'span', style: { color: 'var(--neon-magenta)' }, text: '◈' },
                                {
                                    tag: 'select',
                                    className: 'vibe-model-quick-select',
                                    style: {
                                        background: 'transparent', border: 'none',
                                        color: 'var(--color-text-primary)', fontWeight: 'bold',
                                        fontFamily: 'var(--font-code)', fontSize: '12px',
                                        cursor: 'pointer', outline: 'none'
                                    },
                                    onChange: (e) => {
                                        ModelManager.currentModel = e.target.value;
                                        ModelManager.save();
                                        controller.refreshView(tab);
                                        const { UI } = import('../../../../ui.js').then(m => m.UI.showToast(`Vessel shifted to ${e.target.value}`, "info"));
                                    },
                                    children: modelOptions
                                }
                            ]
                        },
                        // Token Pulse
                        {
                            style: { display: 'flex', alignItems: 'center', gap: '8px' },
                            children: [
                                { tag: 'span', style: { color: 'var(--neon-cyan)' }, text: '✦' },
                                {
                                    tag: 'span',
                                    style: { fontFamily: 'var(--font-code)', fontSize: '11px', color: 'var(--color-text-secondary)' },
                                    children: [
                                        { tag: 'span', style: { opacity: '0.6' }, text: 'Weight: ' },
                                        { tag: 'strong', text: `${tokenCount} Tokens` }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    }
};
