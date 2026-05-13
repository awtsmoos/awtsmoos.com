
/**
 * B"H
 * @file Terrain.js
 * @chapter The Dust of the Earth and the Crystals of Heaven
 */
export const Terrain = {
    '1': { t: 'G_GRASS_FLAT', solid: false, desc: 'Soft spiritual grass of Asiyah.' },
    '2': { t: 'G_DIRT_PATH',  solid: false, desc: 'A path cleared for the righteous.' },
    '.': { t: 'G_SAND',       solid: false, desc: 'The shifting sands of time.' },
    '~': { t: 'G_WATER',      solid: true,  desc: 'The deep waters of Binah. Impassable.' },
    '*': { t: 'G_SNOW',       solid: false, desc: 'Frozen judgment. Cold and pure.' },
    '^': { t: 'G_MOUNTAIN',   solid: true,  desc: 'Elevated earth. Hard to traverse.' },
    
    // YETZIRAH ELEMENTS
    '✧': { t: 'G_CRYSTAL',    solid: false, desc: 'The pure, transparent floor of Formation.' },
    '☁': { t: 'G_CLOUD',      solid: false, desc: 'Vaporous paths holding secrets.' },
    '✨': { t: 'G_LIGHT',      solid: false, encounter: true, desc: 'Floating sparks of raw potential.' },

    // BERIAH ELEMENTS
    '☰': { t: 'G_PARCHMENT',  solid: false, desc: 'The endless scroll of the intellect.' },
    
    // ATZILUT ELEMENTS
    '☼': { t: 'G_OHR_PASHUT', solid: false, desc: 'Simple Light. The dissolution of boundaries.' },

    // TEHOM ELEMENTS
    '♨': { t: 'G_LAVA',       solid: false, encounter: true, desc: 'The consuming fires of Gehinom.' },
    '⬣': { t: 'G_VOID',       solid: true,  desc: 'The absolute emptiness of the Tzimtzum.' },

    // MIKVAH
    '≈': { t: 'G_MIKVAH',     solid: false, isPortal: true, desc: 'Living waters that purify the soul.' }
};
