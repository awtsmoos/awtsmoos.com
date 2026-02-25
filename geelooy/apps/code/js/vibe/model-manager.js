
// B"H
// FILE: js/vibe/model-manager.js

import { UI } from '../ui.js';
import { State } from '../state.js';

/**
 * @class ModelManager
 * @description This vessel orchestrates the selection and configuration of the AI models.
 * It manages the API keys—the passwords to the heavenly libraries—and fetches the
 * specific manifestations (models) available for the given key.
 * By the speech of the Awtsmoos, we choose the instrument for our rectification.
 */
export const ModelManager = {
    keys: [],
    currentKeyIndex: 0,
    currentModel: 'gemini-1.5-flash', // Default soul
    availableModels: [],

    /**
     * @method init
     * @description Awakens the manager from its slumber, recalling the saved 
     * configurations from the archives of previous interactions.
     */
    init() {
        const stored = localStorage.getItem('awtsmoos_vibe_config');
        if (stored) {
            try {
                const config = JSON.parse(stored);
                this.keys = config.keys || [];
                this.currentModel = config.currentModel || 'gemini-1.5-flash';
                this.availableModels = config.availableModels || [];
            } catch(e) { console.error("Config corruption:", e); }
        }
    },

    save() {
        localStorage.setItem('awtsmoos_vibe_config', JSON.stringify({
            keys: this.keys,
            currentModel: this.currentModel,
            availableModels: this.availableModels
        }));
    },

    /**
     * @async
     * @method fetchModels
     * @description Peering into the Gemini API to see which models are ready to serve.
     * It uses the current active key to unlock this information.
     */
    async fetchModels() {
        const key = this.getKey();
        if (!key) return;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
            if (!response.ok) throw new Error(`API Refusal: ${response.status}`);
            
            const data = await response.json();
            // Filter only for models that support content generation
            this.availableModels = data.models
                .filter(m => m.supportedGenerationMethods.includes('generateContent'))
                .map(m => m.name.split('/').pop()); // Extract short name
            
            this.save();
            UI.showToast("B\"H: Heavenly models listed.", "success");
        } catch (e) {
            UI.showToast("Failed to list models: " + e.message, "error");
        }
    },

    getKey() {
        return this.keys[this.currentKeyIndex] || null;
    },

    /**
     * @function getSettingsPanelHTML
     * @description Speaks the HTML of the settings panel into existence.
     * It dynamically generates the list of models if they have been fetched.
     */
    getSettingsPanelHTML() {
        const modelOptions = this.availableModels.length > 0 
            ? this.availableModels.map(m => `<option value="${m}" ${m === this.currentModel ? 'selected' : ''}>${m}</option>`).join('')
            : `<option value="${this.currentModel}">${this.currentModel} (Default)</option>`;

        const keyListHtml = this.keys.map((k, i) => 
            `<div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid rgba(255,255,255,0.1); align-items:center;">
                <span style="font-family:monospace; color:var(--neon-lime);">Key #${i+1}: ••••${k.slice(-4)}</span>
                <button class="remove-key-btn icon-button" data-index="${i}" style="color:var(--color-accent-danger); height:30px; width:30px;">
                    <svg class="svg-icon" style="width:14px; height:14px;"><use href="#icon-trash"></use></svg>
                </button>
             </div>`
        ).join('');

        return `
            <div class="vibe-settings-panel">
                <h4 style="color:var(--neon-cyan); margin-top:0;">Vibe Coding Config</h4>
                
                <div style="margin-bottom:15px;">
                    <label style="display:block; margin-bottom:5px; font-size:0.85em; opacity:0.7;">Active Model:</label>
                    <div style="display:flex; gap:10px;">
                        <select id="vibe-model-select" style="flex-grow:1; background:#000; color:#fff; border:1px solid #333; padding:8px; border-radius:4px;">
                            ${modelOptions}
                        </select>
                        <button id="vibe-refresh-models" class="secondary-btn" title="Refresh Models List" style="min-height:0; padding:0 10px;">↻</button>
                    </div>
                </div>

                <div style="margin-bottom:15px;">
                    <label style="display:block; margin-bottom:5px; font-size:0.85em; opacity:0.7;">API Keys:</label>
                    <div id="vibe-key-list" style="max-height:100px; overflow-y:auto; background:rgba(0,0,0,0.3); border-radius:4px; margin-bottom:10px;">
                        ${keyListHtml || '<div style="padding:10px; color:gray; text-align:center;">No keys found.</div>'}
                    </div>
                    <div style="display:flex; gap:5px;">
                        <input type="password" id="vibe-new-key" placeholder="Paste Gemini Key" style="flex-grow:1; padding:8px;">
                        <button id="vibe-add-key" class="primary-btn" style="min-height:0; padding:0 15px;">Add</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * @function bindSettingsEvents
     * @description Binds the spiritual logic of this manager to the physical DOM elements
     * in the settings dialog.
     */
    bindSettingsEvents(container, onRefreshUI) {
        const addBtn = container.querySelector('#vibe-add-key');
        const keyInput = container.querySelector('#vibe-new-key');
        const refreshBtn = container.querySelector('#vibe-refresh-models');
        const modelSelect = container.querySelector('#vibe-model-select');
        const keyList = container.querySelector('#vibe-key-list');

        if (addBtn && keyInput) {
            addBtn.onclick = () => {
                const val = keyInput.value.trim();
                if (val) {
                    this.keys.push(val);
                    keyInput.value = '';
                    this.save();
                    this.fetchModels().then(onRefreshUI);
                }
            };
        }

        if (refreshBtn) {
            refreshBtn.onclick = () => this.fetchModels().then(onRefreshUI);
        }

        if (modelSelect) {
            modelSelect.onchange = (e) => {
                this.currentModel = e.target.value;
                this.save();
            };
        }

        if (keyList) {
            keyList.onclick = (e) => {
                const btn = e.target.closest('.remove-key-btn');
                if (btn) {
                    const idx = parseInt(btn.dataset.index);
                    this.keys.splice(idx, 1);
                    this.save();
                    onRefreshUI();
                }
            };
        }
    }
};
