
/**
 * B"H
 * @chapter The Pairings (Zivugim)
 */
export const PortalBonds = {
    // === UNIQUE HOUSE/CITY PORTALS ===
    '☗': { partner: '☖', ox: 0, oy: -1 }, '☖': { partner: '☗', ox: 0, oy: 1 },
    '★': { partner: '☆', ox: 0, oy: -1 }, '☆': { partner: '★', ox: 0, oy: 1 },
    '♜': { partner: '♖', ox: 0, oy: -1 }, '♖': { partner: '♜', ox: 0, oy: 1 },
    '⛺': { partner: '🎪', ox: 0, oy: -1 }, '🎪': { partner: '⛺', ox: 0, oy: 1 },
    '🏰': { partner: '🏯', ox: 0, oy: -1 }, '🏯': { partner: '🏰', ox: 0, oy: 1 },
    '🏠': { partner: '🏡', ox: 0, oy: -1 }, '🏡': { partner: '🏠', ox: 0, oy: 1 },
    '🏢': { partner: '🏬', ox: 0, oy: -1 }, '🏬': { partner: '🏢', ox: 0, oy: 1 },
    '🏣': { partner: '🏤', ox: 0, oy: -1 }, '🏤': { partner: '🏣', ox: 0, oy: 1 },
    '🕌': { partner: '🕍', ox: 0, oy: -1 }, '🕍': { partner: '🕌', ox: 0, oy: 1 },
    '🏕️': { partner: '🪔', ox: 0, oy: -1 }, '🪔': { partner: '🏕️', ox: 0, oy: 1 }, 

    '⇪': { partner: '⇫', ox: 1, oy: 0 }, '⇫': { partner: '⇪', ox: 1, oy: 0 },
    '🪜': { partner: '🪜', ox: 1, oy: 0 }, 

    // === UNIQUE SECTOR EDGE PORTALS ===
    '⇧': { partner: '⇩', ox: 0, oy: -1 }, '⇩': { partner: '⇧', ox: 0, oy: 1 },
    '⇡': { partner: '⇣', ox: 0, oy: 1 },  '⇣': { partner: '⇡', ox: 0, oy: -1 },
    '⇢': { partner: '⇣', ox: 0, oy: 1 },  '⇣': { partner: '⇢', ox: 0, oy: -1 },
    '⇦': { partner: '⇨', ox: -1, oy: 0 }, '⇨': { partner: '⇦', ox: 1, oy: 0 },
    '⇚': { partner: '⇛', ox: -1, oy: 0 }, '⇛': { partner: '⇚', ox: 1, oy: 0 },
    '⬅': { partner: '➡', ox: 1, oy: 0 },  '➡': { partner: '⬅', ox: -1, oy: 0 },
    '⇽': { partner: '⇾', ox: 1, oy: 0 },  '⇾': { partner: '⇽', ox: -1, oy: 0 },
    '⤊': { partner: '⤋', ox: 0, oy: -1 }, '⤋': { partner: '⤊', ox: 0, oy: 1 },
    '⤌': { partner: '⤍', ox: 0, oy: -1 }, '⤍': { partner: '⤌', ox: 0, oy: 1 },
    '⤆': { partner: '⤇', ox: -1, oy: 0 }, '⤇': { partner: '⤆', ox: 1, oy: 0 },
    '⤈': { partner: '⤉', ox: -1, oy: 0 }, '⤉': { partner: '⤈', ox: 1, oy: 0 },
    '↰': { partner: '↱', ox: 1, oy: 0 },  '↱': { partner: '↰', ox: -1, oy: 0 },
    '↲': { partner: '↳', ox: 1, oy: 0 },  '↳': { partner: '↲', ox: -1, oy: 0 },
    '⇈': { partner: '⇊', ox: 0, oy: -1 }, '⇊': { partner: '⇈', ox: 0, oy: 1 },
    '↿': { partner: '⇂', ox: 0, oy: -1 }, '⇂': { partner: '↿', ox: 0, oy: 1 },
    '↾': { partner: '⇃', ox: 0, oy: 1 },  '⇃': { partner: '↾', ox: 0, oy: -1 },
    '↽': { partner: '⇁', ox: 0, oy: 1 },  '⇁': { partner: '↽', ox: 0, oy: -1 },
    '⇇': { partner: '⇉', ox: -1, oy: 0 }, '⇉': { partner: '⇇', ox: 1, oy: 0 },
    '↶': { partner: '↷', ox: -1, oy: 0 }, '↷': { partner: '↶', ox: 1, oy: 0 },
    '⇞': { partner: '⇟', ox: 0, oy: -1 }, '⇟': { partner: '⇞', ox: 0, oy: 1 },
    '↺': { partner: '↻', ox: 0, oy: -1 }, '↻': { partner: '↺', ox: 0, oy: 1 },
    '↟': { partner: '↡', ox: 0, oy: 1 },  '↡': { partner: '↟', ox: 0, oy: -1 },
    '↢': { partner: '↣', ox: 0, oy: 1 },  '↣': { partner: '↢', ox: 0, oy: -1 },
    '⤂': { partner: '⤃', ox: 1, oy: 0 },  '⤃': { partner: '⤂', ox: -1, oy: 0 },
    '⤄': { partner: '⤅', ox: 1, oy: 0 },  '⤅': { partner: '⤄', ox: -1, oy: 0 },
    '⇠': { partner: '⇢', ox: -1, oy: 0 }, '⇢': { partner: '⇠', ox: 1, oy: 0 },
    '⤶': { partner: '⤷', ox: -1, oy: 0 }, '⤷': { partner: '⤶', ox: 1, oy: 0 },
    '↤': { partner: '↦', ox: 1, oy: 0 },  '↦': { partner: '↤', ox: -1, oy: 0 },
    '⤹': { partner: '⤸', ox: 1, oy: 0 },  '⤸': { partner: '⤹', ox: -1, oy: 0 },
    
    // Asiyah to Tehom (Abyss)
    '⍐': { partner: '⍗', ox: 0, oy: 1 },   '⍗': { partner: '⍐', ox: 0, oy: -1 },
    '⍌': { partner: '⍍', ox: 0, oy: 1 },   '⍍': { partner: '⍌', ox: 0, oy: -1 },

    // The Far Edges of Asiyah
    '⟰': { partner: '⟱', ox: 0, oy: -1 },  '⟱': { partner: '⟰', ox: 0, oy: 1 },   
    '⟸': { partner: '⟹', ox: 1, oy: 0 },   '⟹': { partner: '⟸', ox: -1, oy: 0 },  
    '⤒': { partner: '⤓', ox: 0, oy: 1 },   '⤓': { partner: '⤒', ox: 0, oy: -1 },

    // ASCENSION PATH (Asiyah -> Yetzirah -> Beriah -> Atzilut)
    '⇑': { partner: '⇓', ox: 0, oy: -1 },  '⇓': { partner: '⇑', ox: 0, oy: 1 }, // Asiyah <-> Yetzirah
    '⤤': { partner: '⤣', ox: 0, oy: -1 },  '⤣': { partner: '⤤', ox: 0, oy: 1 }  // Beriah <-> Atzilut
};
