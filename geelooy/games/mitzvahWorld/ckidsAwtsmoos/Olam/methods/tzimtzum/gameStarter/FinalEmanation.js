
/**
 * B"H
 * @module FinalEmanation
 */
export default class FinalEmanation {
    static execute(olam, loaded) {
        console.log("B\"H - ✨ Finalizing emanation protocols...");
        
        olam.ayshPeula("ready", olam, loaded);
        olam.ayshPeula("reset loading percentage");
        olam.ayshPeula("setup map");
        
        console.log("B\"H - 📢 SIGNAL: ready to start game.");
        olam.ayshPeula("ready to start game");
    }
}
