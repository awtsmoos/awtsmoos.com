
// B"H
/**
 * @file model-manager.js
 * @brief The Keeper of Heavenly Instruments and Prompt Memory.
 */

import { UI } from '../ui.js';
import { VibeAPI } from './api-client.js';

export const ModelManager = {
    keys: [],
    currentModel: null,
    availableModels: [],
    customPrompt: null,

    init() {
        const stored = localStorage.getItem('awtsmoos_vibe_config');
        if (stored) {
            const config = JSON.parse(stored);
            this.keys = config.keys || [];
            this.currentModel = config.currentModel;
            this.availableModels = config.availableModels || [];
            this.customPrompt = config.customPrompt || null;
        }
    },

    save() {
        localStorage.setItem('awtsmoos_vibe_config', JSON.stringify({
            keys: this.keys,
            currentModel: this.currentModel,
            availableModels: this.availableModels,
            customPrompt: this.customPrompt
        }));
    },

    async addKey(key) {
        if (!this.keys.includes(key)) {
            this.keys.push(key);
            UI.showLoading("Synchronizing with AI Source...");
            try {
                const models = await VibeAPI.fetchAvailableModels(key);
                this.availableModels = models;
                if (!this.currentModel && models.length > 0) {
                    this.currentModel = models[0].id;
                }
                this.save();
                UI.showToast("B\"H: Connection Established.", "success");
            } catch (e) {
                this.keys.pop();
                throw e;
            } finally { UI.hideLoading(); }
        }
    },

    getKey() { return this.keys[0] || null; },
    
    getCustomPrompt() { return this.customPrompt; },
    
    setCustomPrompt(text) {
        this.customPrompt = text;
        this.save();
    },

    getSettingsPanelHTML() {
        // This is used for the Global Settings Dialog
        const options = this.availableModels.map(m => 
            `<option value="${m.id}" ${m.id === this.currentModel ? 'selected' : ''}>${m.displayName}</option>`
        ).join('');

        return `
            <div class="vibe-settings-panel">
                <h4 style="color:var(--neon-cyan); margin-top:0;">Vibe Configuration</h4>
                <div style="margin-bottom:15px;">
                    <label style="display:block; margin-bottom:5px; font-size:0.85em; opacity:0.7;">Active Manifestation (Model):</label>
                    <select id="vibe-model-select" style="width:100%; background:#000; color:#fff; border:1px solid var(--neon-cyan); padding:8px; border-radius:4px;">
                        ${options || '<option>Enter API Key first</option>'}
                    </select>
                </div>
                <button id="vibe-change-key-btn" class="secondary-btn" style="width:100%;">Update API Key</button>
            </div>
        `;
    },

    bindSettingsEvents(container, refresh) {
        const select = container.querySelector('#vibe-model-select');
        if (select) {
            select.onchange = (e) => {
                this.currentModel = e.target.value;
                this.save();
            };
        }
        const keyBtn = container.querySelector('#vibe-change-key-btn');
        if (keyBtn) {
            keyBtn.onclick = async () => {
                const { KeyRitual } = await import('./key-ritual.js');
                if (await KeyRitual.prompt()) refresh();
            };
        }
    }
};
