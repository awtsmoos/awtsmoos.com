
// B"H
/**
 * @file ModelRegistry.js
 * @brief The Master List of Manifestations.
 * 
 * CHAPTER CXIV: THE GATHERING OF THE SPARKS
 * 
 * Previously, the system was limited to viewing one dimension at a time.
 * This registry gathers all models from every registered key—Google or OpenRouter—
 * and binds them into a single, unified list. Each model remembers the ID of the 
 * Key that manifested it, allowing for automatic, divine routing of requests.
 */

export const ModelRegistry = {
    _models: [],

    /**
     * B"H
     * Replaces the current census with a new batch of models.
     */
    setAll(models) {
        this._models = models;
    },

    /**
     * B"H
     * Retrieves the entire census.
     */
    getAll() {
        return this._models;
    },

    /**
     * B"H
     * Locates a specific model and identifies its associated Key ID.
     */
    find(modelId) {
        return this._models.find(m => m.id === modelId);
    },

    /**
     * B"H
     * Finds the Key ID associated with a model.
     */
    getKeyIdForModel(modelId) {
        const model = this.find(modelId);
        return model ? model.keyId : null;
    }
};
