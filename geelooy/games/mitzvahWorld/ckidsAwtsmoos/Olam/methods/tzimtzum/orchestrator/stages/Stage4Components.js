
/**
 * B"H
 * @module Stage4Components
 * @description
 * Extracting massive external models and sounds into the cache.
 */
export default class Stage4Components {
    static async manifest(olam, info) {
        if (info.components) {
            // B"H: silent

            await olam.loadComponents(info.components);
        }
    }
}
