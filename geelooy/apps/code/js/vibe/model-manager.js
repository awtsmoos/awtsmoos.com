
// B"H
// FILE: js/vibe/model-manager.js

import { UI } from '../ui.js';
import { VibeAPI } from './api-client.js';

export const ModelManager = {
    keys: [],
    currentKeyIndex: 0,
    currentModel: 'gemini-3-flash-preview', 
    // B"H - Populate fallbackOrder from VibeAPI definitions
    fallbackOrder: [
        'gemini-3-flash-preview',
        'gemini-3-pro-preview',
        "gemini-2.5-pro",
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        'gemini-2.0-flash', 
        'gemini-2.0-flash-lite'
    ],

    init() {
        const stored = localStorage.getItem('vivid_vibe_config');
        if (stored) {
            const config = JSON.parse(stored);
            this.keys = config.keys || [];
            this.currentModel = config.currentModel || 'gemini-3-flash-preview';
        }
    },

    save() {
        localStorage.setItem('vivid_vibe_config', JSON.stringify({
            keys: this.keys,
            currentModel: this.currentModel
        }));
    },

    addKey(key) {
        if (!key) return;
        if (!this.keys.includes(key)) {
            this.keys.push(key);
            this.save();
            UI.showToast("API Key added to Vibe keyring.", "success");
        }
    },

    getKey() {
        if (this.keys.length === 0) return null;
        return this.keys[this.currentKeyIndex];
    },

    rotateKey() {
        if (this.keys.length <= 1) return false; 
        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.keys.length;
        UI.showToast(`Rotating to API Key #${this.currentKeyIndex + 1}`, "info");
        return true;
    },

    downgradeModel() {
        const idx = this.fallbackOrder.indexOf(this.currentModel);
        const nextIdx = (idx + 1) % this.fallbackOrder.length;
        this.currentModel = this.fallbackOrder[nextIdx];
        this.save();
        UI.showToast(`Switching model to ${this.currentModel}`, "warning");
        return true;
    },

    // B"H - Returns HTML for embedding in Main Settings
    getSettingsPanelHTML() {
        const keyListHtml = this.keys.map((k, i) => 
            `<div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid var(--color-border); align-items:center;">
                <span style="font-family:monospace; color:var(--neon-lime);">Key #${i+1}: •••••${k.substr(-4)}</span>
                <button class="remove-key-btn icon-button" data-index="${i}" style="color:var(--color-accent-danger); height:30px; width:30px;">
                    <svg class="svg-icon"><use href="#icon-trash"></use></svg>
                </button>
             </div>`
        ).join('');

        const modelOptions = this.fallbackOrder.map(m => {
            const info = VibeAPI.MODELS[m] || { name: m };
            const isSelected = m === this.currentModel ? 'selected' : '';
            return `<option value="${m}" ${isSelected}>${info.name} (${m})</option>`;
        }).join('');

        return `
            <div class="vibe-settings-panel" style="border: 1px solid var(--color-border); padding: 15px; border-radius: 8px; background: rgba(0,0,0,0.2);">
                <h4 style="margin-top:0; color:var(--neon-cyan);">Gemini API Configuration</h4>
                
                <div style="margin-bottom:15px;">
                    <label style="display:block; margin-bottom:5px; font-size:0.9em; color:var(--color-text-secondary);">Active Model</label>
                    <select id="vibe-model-select" style="width:100%; padding:8px; background:var(--color-bg-primary); color:white; border:1px solid var(--color-border); border-radius:4px;">
                        ${modelOptions}
                    </select>
                </div>

                <div style="margin-bottom:10px;">
                    <label style="display:block; margin-bottom:5px; font-size:0.9em; color:var(--color-text-secondary);">API Keys</label>
                    <div id="vibe-key-list" style="margin-bottom:10px; max-height:120px; overflow-y:auto; border:1px solid var(--color-border); border-radius:4px; background:var(--color-bg-primary);">
                        ${keyListHtml || '<div style="padding:10px; color:gray; text-align:center;">No keys added.</div>'}
                    </div>
                    
                    <a href="https://aistudio.google.com/api-keys" target="_blank" style="display:inline-block; margin-bottom:10px; color:var(--neon-cyan); text-decoration:none; font-size:0.85em; display:flex; align-items:center; gap:5px;">
                        <svg class="svg-icon" style="width:1em; height:1em;"><use href="#icon-external-link"></use></svg>
                        Get API Key from Google AI Studio
                    </a>

                    <div style="display:flex; gap:5px;">
                        <input type="password" id="vibe-new-key" placeholder="Paste Gemini API Key" style="flex-grow:1;">
                        <button id="vibe-add-key-btn" class="primary-btn" style="padding: 0 15px;">Add</button>
                    </div>
                </div>
            </div>
        `;
    },

    // B"H - Handles events within the settings dialog container
    bindSettingsEvents(container, refreshCallback) {
        // Add Key
        const addBtn = container.querySelector('#vibe-add-key-btn');
        const input = container.querySelector('#vibe-new-key');
        if (addBtn && input) {
            addBtn.onclick = () => {
                const val = input.value.trim();
                if (val) {
                    this.addKey(val);
                    if(refreshCallback) refreshCallback(); // Refresh the dialog content
                }
            };
        }

        // Remove Key
        const list = container.querySelector('#vibe-key-list');
        if (list) {
            list.onclick = (e) => {
                const btn = e.target.closest('.remove-key-btn');
                if (btn) {
                    const idx = parseInt(btn.dataset.index);
                    this.keys.splice(idx, 1);
                    this.save();
                    if(refreshCallback) refreshCallback();
                }
            };
        }

        // Model Select
        const select = container.querySelector('#vibe-model-select');
        if (select) {
            select.onchange = () => {
                this.currentModel = select.value;
                this.save();
            };
        }
    },

    async promptForKey() {
        const html = `
            <div style="display: flex; flex-direction: column; gap: 15px; padding: 10px 0;">
                <p>To use Vibe Coding, you need a Google Gemini API Key.</p>
                
                <a href="https://aistudio.google.com/api-keys" target="_blank" class="menu-button" style="text-decoration: none; justify-content: center; background: var(--color-bg-tertiary); border: 1px solid var(--neon-cyan); color: var(--neon-cyan);">
                    <svg class="svg-icon"><use href="#icon-external-link"></use></svg>
                    Get API Key from Google AI Studio
                </a>

                <div style="display:flex; gap:10px; align-items: center; margin-top: 10px;">
                    <input type="password" id="vibe-quick-key" placeholder="Paste your API Key here" style="flex-grow:1;">
                </div>
            </div>
        `;

        const result = await UI.showDialog({
            title: "API Key Required",
            contentHTML: html,
            okText: "Save Key",
            cancelText: "Cancel"
        });

        if (result) {
            // Retrieve value from DOM before it's gone
            const input = document.getElementById('vibe-quick-key');
            if (input && input.value.trim()) {
                this.addKey(input.value.trim());
                return true;
            }
        }
        return false;
    }
};
