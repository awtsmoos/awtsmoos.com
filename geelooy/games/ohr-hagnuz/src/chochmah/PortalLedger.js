
/**
 * B"H
 * @module PortalLedger
 * @chapter The Mystery of the Pairings (Sod HaZivug)
 * @description
 * Every gateway in Asiyah is a unique character. 
 * "The character IS the location." By identifying portals purely through 
 * unique Unicode Otiot, we transcend the limitations of grid-based math 
 * and allow the soul to fold space and time instantaneously.
 * 
 * Each key is the character the Tzaddik steps upon.
 * The 'partner' is the character where the Tzaddik arrives.
 * 'ox/oy' are arrival offsets to ensure we don't instantly teleport back.
 */
export const PortalLedger = {
    // --- SECTOR EDGES (Seamless Transitions) ---
    // Aleph (Center) to Beis (North)
    '⇧': { partner: '⇩', ox: 0, oy: -1 }, 
    '⇩': { partner: '⇧', ox: 0, oy: 1 },
    '⇪': { partner: '⇫', ox: 0, oy: -1 },
    '⇫': { partner: '⇪', ox: 0, oy: 1 },

    // Aleph (Center) to Gimmel (West)
    '⇦': { partner: '⇨', ox: -1, oy: 0 },
    '⇨': { partner: '⇦', ox: 1, oy: 0 },

    // --- CITY DWELLINGS (Interiors) ---
    // Aleph Main House
    '☗': { partner: '☖', ox: 0, oy: -1 },
    '☖': { partner: '☗', ox: 0, oy: 1 },

    // Beis Training Center
    '★': { partner: '☆', ox: 0, oy: -1 },
    '☆': { partner: '★', ox: 0, oy: 1 }
};
