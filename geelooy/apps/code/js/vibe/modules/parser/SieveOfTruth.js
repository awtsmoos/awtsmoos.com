
// B"H
/**
 * @file SieveOfTruth.js
 * @description
 * 
 * CHAPTER IV: THE FRAGMENTED SHIELD OF REVELATION
 * 
 * In the high realms of Asiyah, the Scribe must be cunning to avoid 
 * the "Shevirat HaKelim" (Shattering of the Vessels).
 */

import { MARKERS } from './constants.js';

export class SieveOfTruth {
    static CO = "<!" + "[CD" + "ATA[";
    static CC = "]" + "]" + ">";

    static transfigureToCDATA(rawText) {
        if (!rawText) return "";
        return rawText
            .split(MARKERS.START).join(this.CO)
            .split(MARKERS.END).join(this.CC);
    }

    /**
     * B"H - Ensures every opened tag is balanced with a closure.
     * Updated to handle both raw and escaped tags by normalization.
     */
    static healVessels(text) {
        let healed = text;

        // Ensure CDATA is closed
        const lastOpen = healed.lastIndexOf(this.CO);
        const lastClose = healed.lastIndexOf(this.CC);
        if (lastOpen > lastClose) {
            healed += this.CC;
        }

        // B"H - Normalizing entities to raw brackets for the healing phase
        healed = healed.replace(/&lt;/g, "<").replace(/&gt;/g, ">");

        const tagRegistry = [
            { open: "<" + "cont" + "ent>", close: "<" + "/cont" + "ent>" },
            { open: "<" + "descrip" + "tion>", close: "<" + "/descrip" + "tion>" },
            { open: "<" + "operat" + "ion>", close: "<" + "/operat" + "ion>" },
            { open: "<" + "fi" + "le>", close: "<" + "/fi" + "le>" },
            { open: "<" + "chan" + "ge>", close: "<" + "/chan" + "ge>" }
        ];

        for (const vessel of tagRegistry) {
            const start = healed.lastIndexOf(vessel.open);
            const end = healed.lastIndexOf(vessel.close);
            if (start > end) {
                healed += vessel.close;
            }
        }

        return healed;
    }
}
