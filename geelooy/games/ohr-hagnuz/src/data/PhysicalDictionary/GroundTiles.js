
/**
 * B"H
 * @file GroundTiles.js
 * @chapter The Stones of the Field
 * @description
 * The Awtsmoos creates even the 'inorganic' life. Inside every rock and blade of grass
 * are Hebrew letters keeping it in existence. This dictionary maps the ASCII
 * and Unicode characters to their physical properties in the world of Asiyah.
 */
export const GroundTiles = {
    '1': { t: 'G_GRASS_FLAT', solid: false, desc: 'Soft spiritual grass.' },
    '2': { t: 'G_DIRT_PATH',  solid: false, desc: 'A path cleared for the righteous.' },
    '🌲': { t: 'G_TREE_LARGE', solid: true, obj: 'TREE_1', desc: 'A pillar of nature.' },
    '🌿': { t: 'G_TALL_GRASS', solid: false, encounter: true, desc: 'The thickets of Tohu.' },
    'W': { t: 'G_WALL_STONE',  solid: true, desc: 'Impenetrable Gevurah.' },
    
    // Physical Gateways linking Sectors
    '⇑': { t: 'G_DIRT_PATH', solid: false, isPortal: true, desc: 'Ascend North' },
    '⇓': { t: 'G_DIRT_PATH', solid: false, isPortal: true, desc: 'Descend South' },
    '⇐': { t: 'G_DIRT_PATH', solid: false, isPortal: true, desc: 'Shift West' },
    '⇒': { t: 'G_DIRT_PATH', solid: false, isPortal: true, desc: 'Shift East' }
};
