
/**
 * B"H
 * @file index.js (loadNivrayim)
 * @description
 * 🌌 THE CYCLE OF SUMMONING (BRIYAH) 🌌
 */
import instantiate from "./instantiate.js";
import lifecycle from "./lifecycle.js";
import TimeTracker from "../../../utils/TimeTracker.js";

export default class LoadNivrayim {
    async addObject(type, options) {
        return await instantiate.addObject.call(this, type, options);
    }

    async loadNivrayim(nivrayim) {
        try {
            TimeTracker.start("LOAD_NIVRAYIM");
            // B"H: silent

            
            var nivrayimMade = instantiate.parseDefinitions.call(this, nivrayim);
            TimeTracker.log("LOAD_NIVRAYIM", "Parsed definitions into objects.");

            var totalSize = 0;
            for(var nivra of nivrayimMade) {
                nivra.olam = this;
                var s = 0;
                if (typeof nivra.getSize === 'function') s = await nivra.getSize();
                totalSize += s;
                nivra.size = s;
            }
            this.totalSize = totalSize;

            TimeTracker.log("LOAD_NIVRAYIM", "Beginning heescheel (Mesh Generation & GLB Loading)");
            await lifecycle.runHeescheel.call(this, nivrayimMade);
            
            TimeTracker.log("LOAD_NIVRAYIM", "Running madeAll & Placeholder Logic");
            await lifecycle.runMadeAll.call(this, nivrayimMade);
            
            for (var nivra of nivrayimMade) {
                await this.doPlaceholderAndEntityLogic(nivra);
            }

            TimeTracker.log("LOAD_NIVRAYIM", "Running ready & afterBriyah");
            await lifecycle.runReady.call(this, nivrayimMade);
            await lifecycle.runAfterBriyah.call(this, nivrayimMade);

            this.ayshPeula("updateProgress",{
                loadedNivrayim: Date.now()
            });

            if (!this.enlightened && typeof this.ohr === 'function') {
                try {
                    this.ohr();
                    TimeTracker.log("LOAD_NIVRAYIM", "Light Poured (Ohr)");
                } catch(e) {
                    console.error("B\"H - ⚠️ Lighting resistance encountered:", e);
                }
            }

            TimeTracker.finish("LOAD_NIVRAYIM", "All souls solidified and linked.");
            return nivrayimMade || []; 
        } catch (error) {
            console.error("B\"H - 🚨 THE ENTIRE CREATION PROTOCOL FAILED:", error);
            return []; 
        }
    }
}
