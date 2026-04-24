
/**
 * B"H
 * Placeholder and Entity Logic Main Entry
 */
import placeholders from "./placeholders.js";
import entities from "./entities.js";

export default class PlaceholderAndEntities {
    async doPlaceholderAndEntityLogic(nivra) {
        var d = nivra?.dialogue?.shlichuseem;
        if(nivra.dialogue) {
            if(!this.nivrayimWithDialogue) this.nivrayimWithDialogue = [];
            this.nivrayimWithDialogue.push(nivra)
        }
      
        if(d) {
            this.nivrayimWithShlichuseem.push(nivra);
            nivra.hasShlichuseem = d;
            var isAvailable = this.ayshPeula("is shlichus available", d);
            nivra.iconPath = "indicators/exclamation.svg";
            nivra.shlichusAvailable = isAvailable;
        }

        await placeholders.process.call(this, nivra);
        await entities.doEntityDataCheck.call(this, nivra);
        await entities.doEntityNameCheck.call(this, nivra);
    }
}
