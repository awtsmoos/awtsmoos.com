
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

    // === UNIQUE SECTOR EDGE PORTALS ===
    '⇧': { partner: '⇩', ox: 0, oy: -1 }, '⇩': { partner: '⇧', ox: 0, oy: 1 },
    '⇪': { partner: '⇫', ox: 0, oy: -1 }, '⇫': { partner: '⇪', ox: 0, oy: 1 },
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
    '⤣': { partner: '⤤', ox: 0, oy: 1 },  '⤤': { partner: '⤣', ox: 0, oy: -1 },
    '⤡': { partner: '⤢', ox: 0, oy: 1 },  '⤢': { partner: '⤡', ox: 0, oy: -1 },
    
    // Southward
    '⍐': { partner: '⍗', ox: 0, oy: 1 },   '⍗': { partner: '⍐', ox: 0, oy: -1 },
    '⍌': { partner: '⍍', ox: 0, oy: 1 },   '⍍': { partner: '⍌', ox: 0, oy: -1 },

    // THE DEEP EXTREMES (New Expansions)
    '⟰': { partner: '⟱', ox: 0, oy: -1 },  '⟱': { partner: '⟰', ox: 0, oy: 1 },   // Hey to YudDalet (Snow)
    '⟸': { partner: '⟹', ox: 1, oy: 0 },   '⟹': { partner: '⟸', ox: -1, oy: 0 },  // Dalet to YudHey (Mountain)
    '⤒': { partner: '⤓', ox: 0, oy: 1 },   '⤓': { partner: '⤒', ox: 0, oy: -1 }   // YudGimmel to YudVav (Ocean)
};
