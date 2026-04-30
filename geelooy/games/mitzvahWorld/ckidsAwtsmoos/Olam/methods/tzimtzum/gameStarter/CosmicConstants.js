
/**
 * B"H
 * @module CosmicConstants
 */
export default class CosmicConstants {
    static apply(olam, info) {
        if (info.vars) olam.vars = { ...info.vars };
        if (info.assets) olam.setAssets(info.assets);
        
        if (info.set) {
            try {
                Object.assign(olam, info.set);
                if (olam.userProgressManager) olam.userProgressManager.load();
            } catch(e) { 
                console.error("B\"H - Global set error:", e); 
            }
        }
    }
}
