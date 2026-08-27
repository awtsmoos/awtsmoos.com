
// B"H
/**
 * @file key-ritual.js
 * @brief The Invitation to Enlightenment.
 */

import { UI } from '../ui.js';
import { ModelManager } from './model-manager.js';

export const KeyRitual = {
    /**
     * @async
     * @function prompt
     * @description Displays a cool, professional UI to capture the Gemini API Key.
     */
    async prompt() {
        const html = `
            <div class="api-key-prompt">
                <p style="margin-bottom: 20px; line-height: 1.5; color: var(--color-text-secondary);">
                    To manifest code through the Vibe Timestream, you must provide a <strong>Gemini API Key</strong>. 
                    This key acts as a conduit between your will and the AI's potential.
                </p>
                <div class="field-group">
                    <label>Gemini API Key</label>
                    <input type="password" id="vibe-key-input" placeholder="Enter your ghp_... or similar key">
                </div>
                <div style="margin-top: 10px; font-size: 0.8em; text-align: right;">
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color: var(--neon-cyan); text-decoration: underline;">
                        Get your free key here
                    </a>
                </div>
                <style>
                    .api-key-prompt .field-group { display: flex; flex-direction: column; gap: 8px; }
                    .api-key-prompt input { 
                        background: var(--color-bg-deep); 
                        border: 1px solid var(--neon-cyan); 
                        color: #fff; 
                        padding: 12px; 
                        border-radius: 8px;
                        box-shadow: 0 0 10px var(--glow-cyan);
                    }
                </style>
            </div>
        `;

        const result = await UI.showDialog({
            title: "Unlock Vibe Coding",
            contentHTML: html,
            okText: "Connect to Heavens",
            cancelText: "Stay Silent"
        });

        if (result) {
            const key = document.getElementById('vibe-key-input').value.trim();
            if (key) {
                await ModelManager.addKey(key);
                return true;
            }
        }
        return false;
    }
};
