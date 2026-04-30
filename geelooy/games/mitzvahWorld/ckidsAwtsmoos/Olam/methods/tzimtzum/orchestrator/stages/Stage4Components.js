
/**
 * B"H
 * @module Stage4Components
 * @description
 * Extracting massive external models and sounds into the cache.
 */
export default class Stage4Components {
    static async manifest(olam, info) {
        if (info.components) {
            console.log("B\"H - 🌌 STAGE 4: Manifesting external vessels.");
            await olam.loadComponents(info.components);
        }
    }
}
