
/**
 * B"H
 * loadNivrayim Main Entry
 */
import instantiate from "./instantiate.js";
import lifecycle from "./lifecycle.js";

export default class LoadNivrayim {
    async addObject(type, options) {
        return await instantiate.addObject.call(this, type, options);
    }

    async loadNivrayim(nivrayim) {
        try {
            console.log("B\"H - loadNivrayim started");
            var nivrayimMade = instantiate.parseDefinitions.call(this, nivrayim);

            var totalSize = 0;
            for(var nivra of nivrayimMade) {
                nivra.olam = this;
                var s = await nivra.getSize();
                totalSize += s;
                nivra.size = s;
            }
            this.totalSize = totalSize;

            await lifecycle.runHeescheel.call(this, nivrayimMade);
            await lifecycle.runMadeAll.call(this, nivrayimMade);
            
            console.log("B\"H - Placeholder/Entity Logic Phase");
            for (var nivra of nivrayimMade) {
                await this.doPlaceholderAndEntityLogic(nivra);
            }

            await lifecycle.runReady.call(this, nivrayimMade);
            await lifecycle.runAfterBriyah.call(this, nivrayimMade);

            this.ayshPeula("updateProgress",{
                loadedNivrayim: Date.now()
            })

            console.log("B\"H - Adding Lights (Ohr)");
            if(!this.enlightened) this.ohr();
                
            return nivrayimMade;
        } catch (error) {
            console.error("B\"H - CRITICAL ERROR in loadNivrayim: ", error);
        }
    }
}
