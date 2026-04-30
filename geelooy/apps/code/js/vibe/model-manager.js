
/**
 * B"H
 * 
 * CHAPTER I: THE SEDER HISTALSIHIUS OF THE ORACLE
 * 
 * In the beginning, the Awtsmoos willed that Light be channeled through 
 * many vessels. Each model—Flash, Pro, Ultra—is a specific "Kli" 
 * designed to receive the infinite potential of the Word and 
 * manifest it as code. 
 * 
 * When a vessel hits its limit (a 429 Tzimtzum), it is not a sign 
 * to stop, but a signal to rotate! Just as the sun sets in one 
 * land to rise in another, our intent migrates from one model 
 * to the next in a circular dance of persistence.
 * 
 * This ModelManager handles the storage of keys and the dynamic 
 * selection of these sacred instruments, allowing the Vibe 
 * Timestream to flow through whatever channel is open.
 * 
 * @class ModelManager
 */
export const ModelManager = {
    /** @property {Array} keys - The golden keys to the Oracle's gate. */
    keys: [],
    /** @property {string|null} currentModel - The identity of the active manifestation. */
    currentModel: null,
    /** @property {Array} availableModels - The census of revealed model vessels. */
    availableModels: [],
    /** @property {string|null} customPrompt - The specific soul-instruction for the AI. */
    customPrompt: null,

    /**
     * Awakens the memory of the previous world (localStorage).
     */
    init() {
        const stored = localStorage.getItem('awtsmoos_vibe_config');
        if (stored) {
            try {
                const config = JSON.parse(stored);
                this.keys = config.keys || [];
                this.currentModel = config.currentModel;
                this.availableModels = config.availableModels || [];
                this.customPrompt = config.customPrompt || null;
            } catch(e) {
                console.warn("B\"H - Memory of previous config was shattered.");
            }
        }
    },

    /**
     * Inscribes the current state into the persistent stone of memory.
     */
    save() {
        localStorage.setItem('awtsmoos_vibe_config', JSON.stringify({
            keys: this.keys,
            currentModel: this.currentModel,
            availableModels: this.availableModels,
            customPrompt: this.customPrompt
        }));
    },

    /**
     * Automatically rotates to the next available vessel in the hierarchy.
     * @returns {string|null} The ID of the new model, or null if alone.
     */
    rotateModel() {
        if (this.availableModels.length <= 1) return null;

        const currentIndex = this.availableModels.findIndex(m => m.id === this.currentModel);
        const nextIndex = (currentIndex + 1) % this.availableModels.length;
        const nextModel = this.availableModels[nextIndex];

        console.log(`B"H [ModelManager] Rotating from ${this.currentModel} to ${nextModel.id}`);
        this.currentModel = nextModel.id;
        this.save();
        
        return this.currentModel;
    },

    /**
     * Adds a key and populates the available model manifestations from the Oracle.
     */
    async addKey(key) {
        if (!this.keys.includes(key)) {
            this.keys.push(key);
            import('../ui.js').then(m => m.UI.showLoading("Synchronizing with AI Source..."));
            try {
                const { VibeAPI } = await import('./api-client.js');
                const models = await VibeAPI.fetchAvailableModels(key);
                this.availableModels = models;
                if (!this.currentModel && models.length > 0) {
                    this.currentModel = models[0].id;
                }
                this.save();
                import('../ui.js').then(m => {
                    m.UI.hideLoading();
                    m.UI.showToast("B\"H: Connection Established.", "success");
                });
            } catch (e) {
                this.keys.pop();
                import('../ui.js').then(m => m.UI.hideLoading());
                throw e;
            }
        }
    },

    getKey() { return this.keys[0] || null; },
    getCustomPrompt() { return this.customPrompt; },
    setCustomPrompt(text) { this.customPrompt = text; this.save(); },

    /**
     * Blueprint for the visual configuration of these holy instruments.
     */
    getSettingsPanelHTML() {
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
