
/**
 * B"H
 * @module Stage3Fonts
 * @description
 * Drawing down the shapes of the Hebrew alphabet. 
 * "With 22 letters He engraved them, hewed them, weighed them..."
 */
export default class Stage3Fonts {
    static async load(olam) {
        console.log("B\"H - 🌌 STAGE 3: Drawing down the holy fonts.");
        if (typeof olam.loadHebrewFonts === 'function') {
            await olam.loadHebrewFonts();
        }
    }
}
