
// B"H
/**
 * tzimtzum.js - The initial "tzimtzum" setup method for Olam.
 * Refined to ensure no null pointer exceptions occur during world manifestation.
 */
import defaultConfig from "../../defaultConfig.js";

export default class {
    /**
     * Manifests the world from the provided data.
     * @param {Object} options - System and user info.
     */
    async tzimtzum({ systemInfo = {}, userInfo = {} } = {}) {
        console.log("B\"H - Starting Tzimtzum Process...");
        var info = { ...systemInfo, ...userInfo };
        var { worldDayuhURL } = info;
        
        if (typeof worldDayuhURL == "string") {
            try {
                var f = await import(worldDayuhURL);
                if (f?.default) {
                    Object.assign(info, f.default);
                    Object.assign(userInfo, f.default);
                    console.log("B\"H - World Data Imported Successfully");
                }
            } catch (e) {
                console.warn("B\"H - Couldn't load dayuh: ", worldDayuhURL);
            }
        }
        
        if (defaultConfig && defaultConfig.components) {
            info.components = { ...defaultConfig.components, ...(info.components || {}) };
        }

        try {
            var on = info.on;
            if (typeof on == "object") {
                Object.keys(on).forEach(q => { this.on(q, on[q]); });
            }

            if (info.shaym) this.shaym = info.shaym;
            await this.loadHebrewFonts();
            
            if (!info.nivrayim) info.nivrayim = {};
            if (info.components) await this.loadComponents(info.components);
            if (info.vars) this.vars = { ...info.vars };
            if (info.assets) this.setAssets(info.assets);
            if (info.modules) await this.getModules(info.modules);
            
            if (info.set) {
                Object.assign(this, info.set);
                if (this.userProgressManager) this.userProgressManager.load();
            }

            if (!this.resetY) this.resetY = -6;

            if (info.html) {
                if (!this.styled) { 
                    var style = {
                        tag: "style",
                        innerHTML: /*css*/`
                            .ikarGameMenu { overflow: hidden; position: absolute; transform-origin:top left; bottom:0; right:0; top: 0; left: 0; }
                            .gameUi > div { position:absolute; }
                        `
                    };
                    this.styled = true;
                    var par = {
                        shaym: `ikarGameMenu`,
                        parent: "main av",
                        children: [info.html, style],
                        className: `ikarGameMenu`
                    };
                    await this.ayshPeula("htmlCreate", par);
                    this.htmlUI = par;
                }
            }

            var loaded = await this.loadNivrayim(info.nivrayim);
            
            // B"H: Guard against undefined gameState
            const gState = info.gameState || {};
            var st = gState[this.shaym];
            if (st && st.shaym == this.shaym) {
                this.setGameState(st);
            }

            this.ayshPeula("ready", this, loaded);
            this.ayshPeula("reset loading percentage");
            this.ayshPeula("setup map");
            this.ayshPeula("ready to start game");
            
            this.baseInfo = userInfo;
            return loaded;
        } catch (e) {
            console.error("B\"H - Critical Issue in Tzimtzum:", e);
            this.ayshPeula("error", {
                code: "ISSUE_IN_TZIMTZUM",
                details: e.stack,
                message: "A fundamental error prevented the world from forming."
            });
        }
    }
}
