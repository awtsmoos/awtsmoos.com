
/**
 * B"H
 * @module OlamInstantiator
 * @description
 * 🌍 THE CRAFTING OF THE GLOBE 🌍
 * Instantiates the Olam class and applies the system variables.
 */
export class OlamInstantiator {
    static async instantiate(OlamClass, payload) {
        const olam = new OlamClass();
        
        if (payload.systemInfo && payload.systemInfo.set) {
            Object.assign(olam, payload.systemInfo.set);
        }

        await olam.init();
        return olam;
    }
}
