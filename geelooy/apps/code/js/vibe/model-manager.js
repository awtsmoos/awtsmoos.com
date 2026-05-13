
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
            const bestDefault = this.getPreferredModel({
                requireFree: true,
                requireTools: true
            }) || this.getPreferredModel({
                requireFree: true
            }) || this.availableModels[0];
            
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
        return this.getKeyForModel(this.currentModel);
    },

    getActiveKeyObject() {
        const keyId = ModelRegistry.getKeyIdForModel(this.currentModel);
        return KeyRegistry.getAll().find(k => k.id === keyId);
    },

    getActiveModel() {
        return ModelRegistry.find(this.currentModel);
    },

    getModel(modelId) {
        return ModelRegistry.find(modelId);
    },

    getKeyForModel(modelId) {
        const keyId = ModelRegistry.getKeyIdForModel(modelId);
        const keyObj = KeyRegistry.getAll().find(k => k.id === keyId);
        return keyObj ? keyObj.key : null;
    },

    async addKey(rawKey, label = null) {
        const newKey = KeyRegistry.add(rawKey, label);
        await this.refreshModels();

        const providerDefaults = this.getPreferredModel({
            provider: newKey.provider,
            requireFree: true,
            requireTools: true
        }) || this.getPreferredModel({
            provider: newKey.provider,
            requireFree: true
        }) || this.getPreferredModel({ provider: newKey.provider });

        if (providerDefaults) {
            this.currentModel = providerDefaults.id;
            this.save();
        }

        return newKey;
    },

    getModelsForProvider(provider) {
        return this.availableModels.filter(model => model.provider === provider);
    },

    getPreferredModel({
        provider = null,
        requireFree = false,
        requireTools = false,
        excludeIds = []
    } = {}) {
        return this.availableModels.find(model => {
            if (provider && model.provider !== provider) return false;
            if (excludeIds.includes(model.id)) return false;
            if (requireFree && !AgentCapabilities.isFree(model)) return false;
            if (requireTools && !AgentCapabilities.supportsTools(model)) return false;
            return true;
        }) || null;
    },

    getFallbackModel(currentModelId, options = {}) {
        const currentModel = this.getModel(currentModelId) || this.getActiveModel();
        const provider = options.provider || currentModel?.provider || null;
        const triedIds = [currentModelId, ...(options.excludeIds || [])].filter(Boolean);

        return this.getPreferredModel({
            provider,
            requireFree: options.requireFree !== false,
            requireTools: !!options.requireTools,
            excludeIds: triedIds
        }) || this.getPreferredModel({
            provider,
            requireFree: options.requireFree !== false,
            excludeIds: triedIds
        }) || null;
    },

    // Bridge for specific components
    getKey(provider = null) {
        if (!provider) return this.getActiveKey();
        const providerKeys = KeyRegistry.getAll()
            .filter(k => k.provider === provider)
            .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
        return providerKeys[0]?.key || null;
    },
    getCustomPrompt() { return this.customPrompt; },
    setCustomPrompt(text) { this.customPrompt = text; this.save(); }
};
