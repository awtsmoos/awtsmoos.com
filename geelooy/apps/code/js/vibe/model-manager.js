
// B"H
/**
 * @file model-manager.js
 * @brief The Master Orchestrator of Cross-Dimensional Vision.
 * 
 * RECTIFICATION: 
 * We have abolished the 'Active Key' restriction. The system now aggregates 
 * models from ALL keys. When a model is chosen, the system knows exactly 
 * which key to use. 
 */

import { KeyRegistry } from './agent/state/KeyRegistry.js';
import { ModelRegistry } from './agent/state/ModelRegistry.js';
import { OracleHarvester } from './agent/logic/OracleHarvester.js';
import { AgentCapabilities } from './agent/logic/AgentCapabilities.js';

export const ModelManager = {
    currentModel: null,
    customPrompt: null,

    get availableModels() {
        return ModelRegistry.getAll();
    },

    init() {
        const stored = localStorage.getItem('awtsmoos_vibe_manager_state_v2');
        if (stored) {
            try {
                const config = JSON.parse(stored);
                ModelRegistry.setAll(config.availableModels || []);
                this.currentModel = config.currentModel;
                this.customPrompt = config.customPrompt || null;
            } catch(e) {}
        }

        // B"H - Automatic Harvest on init if keys exist
        if (KeyRegistry.getAll().length > 0) {
            this.refreshModels().catch(()=>{});
        }
    },

    save() {
        localStorage.setItem('awtsmoos_vibe_manager_state_v2', JSON.stringify({
            currentModel: this.currentModel,
            availableModels: this.availableModels,
            customPrompt: this.customPrompt
        }));
    },

    /**
     * B"H
     * Aggregates models from all keys in the registry.
     */
    async refreshModels() {
        await OracleHarvester.harvest();
        
        // B"H - Maintain model continuity or pick a smart default
        if (!this.currentModel || !ModelRegistry.find(this.currentModel)) {
            const bestDefault = this.availableModels.find(m => 
                AgentCapabilities.isFree(m) && AgentCapabilities.supportsTools(m)
            ) || this.availableModels[0];
            
            this.currentModel = bestDefault?.id || null;
        }

        this.save();
        window.dispatchEvent(new CustomEvent('awtsmoos-models-updated'));
    },

    /**
     * B"H
     * Selects a model for active manifestation.
     */
    setModel(id) {
        if (ModelRegistry.find(id)) {
            this.currentModel = id;
            this.save();
            return true;
        }
        return false;
    },

    /**
     * B"H
     * Retrieves the API Key associated with the current model.
     */
    getActiveKey() {
        const keyId = ModelRegistry.getKeyIdForModel(this.currentModel);
        const keyObj = KeyRegistry.getAll().find(k => k.id === keyId);
        return keyObj ? keyObj.key : null;
    },

    getActiveKeyObject() {
        const keyId = ModelRegistry.getKeyIdForModel(this.currentModel);
        return KeyRegistry.getAll().find(k => k.id === keyId);
    },

    getActiveModel() {
        return ModelRegistry.find(this.currentModel);
    },

    // Bridge for specific components
    getKey(provider) { return this.getActiveKey(); },
    getCustomPrompt() { return this.customPrompt; },
    setCustomPrompt(text) { this.customPrompt = text; this.save(); }
};
