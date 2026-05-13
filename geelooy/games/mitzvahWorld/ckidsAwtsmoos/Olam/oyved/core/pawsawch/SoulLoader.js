
/**
 * B"H
 * @module SoulLoader
 * @description
 * 👻 THE BREATH OF THE SOULS 👻
 * Extracts the Nivrayim manifest and pours it into the Olam.
 */
export class SoulLoader {
    static async load(olam, payload) {
        const worldData = payload.userInfo || payload;
        const nivrayimData = worldData.nivrayim || {};
        
        const loadStart = performance.now();
        
        await olam.loadNivrayim(nivrayimData);
        
        const loadTime = (performance.now() - loadStart).toFixed(2);
        console.log(`B"H - ⏱️ Souls materialized in ${loadTime}ms.`);
    }
}
