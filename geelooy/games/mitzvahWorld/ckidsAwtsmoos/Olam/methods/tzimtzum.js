// B"H
/**
 * tzimtzum.js - The Initial Contraction.
 * Defines the order in which the Nothingness becomes Something.
 * Refined with strict phase-ordering and atomic security.
 */
import defaultConfig from "../../defaultConfig.js";

export default class {
    /**
     * tzimtzum - The Great Manifestation Pulse.
     */
    async tzimtzum({ systemInfo = {}, userInfo = {} } = {}) {
        console.log("B\"H - Tzimtzum Pulse Initiated.");
        let info = { ...systemInfo, ...userInfo };
        const { worldDayuhURL } = info;
        
        try {
            // PHASE 1: CHOCHMAH (Wisdom) - Accessing the Divine Blueprint
            if (typeof worldDayuhURL == "string") {
                this.ayshPeula("increase loading percentage", {
                    amount: 5, reset: true, action: "Divine Will", subAction: "Accessing Blueprint..."
                });
                const f = await import(worldDayuhURL);
                if (f?.default) {
                    Object.assign(info, f.default);
                    Object.assign(userInfo, f.default);
                }
            }
            
            if (defaultConfig?.components) {
                info.components = { ...defaultConfig.components, ...(info.components || {}) };
            }

            // PHASE 2: BINAH (Understanding) - Initializing Environmental Laws and Modules
            await this.loadHebrewFonts();
            if (info.modules) await this.getModules(info.modules);
            if (info.vars) this.vars = { ...info.vars };
            if (info.assets) this.setAssets(info.assets);
            
            // PHASE 3: DA'AT (Knowledge) - The Unified Draw-Down
            // All components are summoned into the local cache before the forge begins
            if (info.components) await this.loadComponents(info.components);
            
            if (info.set) {
                Object.assign(this, info.set);
                if (this.userProgressManager) this.userProgressManager.load();
            }

            // PHASE 4: MALCHUT (Kingship) - The Atomic Forge
            // This is where conceptual blueprints are projected into physical vessels
            const loaded = await this.loadNivrayim(info.nivrayim || {});
            
            // Sync saved states
            const gState = info.gameState || {};
            const st = gState[this.shaym];
            if (st && st.shaym == this.shaym) this.setGameState(st);

            // PHASE 5: REVELATION - Awakening the Scene
            this.ayshPeula("ready", this, loaded);
            this.ayshPeula("reset loading percentage");
            this.ayshPeula("setup map");
            this.ayshPeula("ready to start game");
            
            this.baseInfo = userInfo;
            return loaded;

        } catch (e) {
            console.error("B\"H - Create Error in Tzimtzum Phase:", e);
            this.ayshPeula("error", {
                code: "TZIMTZUM_SHATTERED",
                details: e.stack,
                message: "The creation sequence was interrupted by an imperfection in the blueprint."
            });
        }
    }
}
