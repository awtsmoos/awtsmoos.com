/*
ב"ה
B"H
*/

/**
 * @file Assiyah/index.js
 * @description The central vessel for the World of Assiah. This file imports the major Sefirotic groupings
 * (KaChaBaD, ChaGaS, NeHY, Malchut) and integrates them into the singular ASSIAH object that will be exported.
 * This is the point of unification where all the disparate actions of the world are gathered into one functional whole.
 * This file is written as if all its dependencies exist, reflecting its final, perfected state.
 */

import { KETER, CHOCHMAH, BINAH, DAAT } from './KaChaBaD.js';
import { CHESED, GEVURAH, TIFERET } from './ChaGaS.js';
import { NETZACH, HOD, YESOD } from './NeHY.js';
import { MALCHUT } from './Malchus.js';

export const ASSIAH = {
    Olam: null,

    // The Ten Sefirot, fully populated by the imported modules.
    KETER,
    CHOCHMAH,
    BINAH,
    DAAT,
    CHESED,
    GEVURAH,
    TIFERET,
    NETZACH,
    HOD,
    YESOD,
    MALCHUT,

    /**
     * @description The init function that breathes life into the entire structure of Assiah.
     * It creates the Olam (world state), passes it to all sub-modules for initialization,
     * and begins the process of creation.
     * @param {object} ATZILUT - The World of Emanation.
     * @param {object} BERIAH - The World of Creation.
     * @param {object} YETZIRAH - The World of Formation.
     */
    init(ATZILUT, BERIAH, YETZIRAH) {
        window.ASSIAH = this;
        this.Olam = { ATZILUT, BERIAH, YETZIRAH, ASSIAH: this };
        
        // Initialize all Sefirot, passing them a reference to the Olam.
        const sefirot = [
            this.KETER, this.CHOCHMAH, this.BINAH, this.DAAT,
            this.CHESED, this.GEVURAH, this.TIFERET,
            this.NETZACH, this.HOD, this.YESOD,
            this.MALCHUT
        ];
        sefirot.forEach(sefirah => sefirah.init(this.Olam));
        
        // Chochmah, the first flash of thought, begins the creation process.
        this.CHOCHMAH.genesis();

        this.MALCHUT.bindUIEvents()
        
        // Da'at, the bridge, reveals the first state of the world to the user.
        this.DAAT.eventHandlers.showMainMenu();
    }
};
