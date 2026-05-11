
// B"H
/**
 * @file ManagerUI.js
 * @brief The High-Intelligence Throne for AI Governance.
 * 
 * POEM OF THE RECTIFIED DASHBOARD:
 * Out of the mess of the previous age,
 * We write a new and holy page.
 * With neon light and shadow deep,
 * The promises of the Will we keep.
 * No backticks to shatter the code's pure skin,
 * Allowing the infinite light to enter within.
 * The Dashboard is set, a Merkava for thought,
 * To manage the world that the user has brought.
 */

import { VibeDB } from '../../db.js';
import { ModelManager } from '../../model-manager.js';
import { PromptBuilder } from '../../modules/prompt-builder.js';
import { HTML } from '../../../html-generator.js';

import { GatekeeperBox } from './GatekeeperBox.js';
import { DirectiveBox } from './DirectiveBox.js';
import { TimestreamLedger } from './TimestreamLedger.js';

export const VibeManagerUI = {
    /**
     * B"H - Orchestrates the total manifestation of the Manager dashboard.
     * @param {HTMLElement} container - The physical DOM vessel.
     * @param {Object} controller - The master mind.
     */
    async render(container, controller) {
        const sessions = await VibeDB.getAllSessions();
        const gKey = ModelManager.getKey('google') || "";
        const orKey = ModelManager.getKey('openrouter') || "";
        const customPrompt = ModelManager.getCustomPrompt() || PromptBuilder.getDefaultSystemBase();
        const models = ModelManager.availableModels;
        
        container.innerHTML = '';
        
        // CHAPTER I: THE FOUNDATION
        const wrapper = HTML({
            className: 'vibe-manager-scroll-wrap',
            children: [
                {
                    className: 'vibe-manager-content',
                    children: [
                        // CHAPTER II: THE HEADER OF HOD
                        {
                            className: 'vibe-manager-header',
                            children: [
                                { 
                                    tag: 'h1', 
                                    className: 'vibe-manager-header-title', 
                                    text: 'Chariot Sentinel' 
                                },
                                { 
                                    tag: 'span', 
                                    className: 'vibe-manager-header-sub', 
                                    text: 'Vibe Dashboard :: B"H :: Autonomous Intelligence Governor' 
                                }
                            ]
                        },
                        
                        // CHAPTER III: THE TRIPARTITE REALMS
                        {
                            className: 'vibe-manager-grid',
                            children: [
                                // LEFT COLUMN: LOGIC AND SPEECH
                                {
                                    className: 'vibe-manager-column',
                                    children: [
                                        GatekeeperBox.build(gKey, orKey, models),
                                        DirectiveBox.build(customPrompt)
                                    ]
                                },
                                // RIGHT COLUMN: RECORDED HISTORY
                                TimestreamLedger.build(sessions)
                            ]
                        }
                    ]
                }
            ]
        });

        container.appendChild(wrapper);

        // CHAPTER IV: BINDING THE WILL
        this._bind(container, controller, sessions);
    },

    /**
     * B"H - Animates the static forms.
     */
    _bind(container, controller, sessions) {
        TimestreamLedger.bind(container, controller, sessions, () => this.render(container, controller));
        GatekeeperBox.bind(container, () => this.render(container, controller));
        DirectiveBox.bind(container);
    }
};
