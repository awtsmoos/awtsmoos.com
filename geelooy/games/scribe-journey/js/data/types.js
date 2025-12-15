
// B"H
// js/data/types.js

export const TYPE_CHART = {
    'Physical': {
        weak: ['Gevurah'],
        strong: ['Netzach'],
        immune: []
    },
    'Chesed': { // Water/Kindness
        weak: ['Gevurah'], // Fire boils water? No, Water beats Fire. Weak TO Hod (Vessels limit flow)
        strong: ['Gevurah', 'Qliphoth'], // Water extinguishes fire, Kindness sweetens judgment
        immune: []
    },
    'Gevurah': { // Fire/Severity
        weak: ['Chesed'], // Overwhelmed by Kindness
        strong: ['Tiferet', 'Netzach'], // Fire consumes Air/Earth
        immune: []
    },
    'Tiferet': { // Beauty/Harmony
        weak: ['Gevurah'],
        strong: ['Hod'],
        immune: []
    },
    'Netzach': { // Eternity/Victory/Nature
        weak: ['Gevurah'],
        strong: ['Hod'], // Persistence overcomes submission
        immune: []
    },
    'Hod': { // Splendor/Logic
        weak: ['Netzach'],
        strong: ['Chesed'], // Vessels contain/limit the flow
        immune: []
    },
    'Yesod': { // Foundation
        weak: ['Hod'],
        strong: ['Malkuth'],
        immune: []
    },
    'Malkuth': { // Kingship/Earth
        weak: ['Yesod'],
        strong: ['Physical'],
        immune: []
    },
    'Keter': { // Crown/Will
        weak: [],
        strong: ['Binah', 'Chokhmah', 'Daat', 'Qliphoth'], // Will overrides intellect
        immune: ['Physical'] // Spirit untoucheable by matter
    },
    'Chokhmah': { // Wisdom
        weak: ['Keter'],
        strong: ['Binah'],
        immune: []
    },
    'Binah': { // Understanding
        weak: ['Chokhmah', 'Amalek'], // Doubt defies logic
        strong: ['Daat'],
        immune: []
    },
    'Qliphoth': { // Shells/Evil
        weak: ['Kedushah', 'Chesed', 'Gevurah'],
        strong: ['Physical', 'Malkuth'],
        immune: []
    },
    'Amalek': { // Doubt/Cynicism
        weak: ['Kedushah', 'Netzach'], // Faith/Persistence beats doubt
        strong: ['Binah', 'Hod'], // Logic fails against irrational doubt
        immune: []
    },
    'Kedushah': { // Holiness (Special Move Type)
        weak: [],
        strong: ['Qliphoth', 'Amalek'],
        immune: []
    }
};

export function getTypeEffectiveness(moveType, defenderType) {
    if (!moveType || !defenderType) return 1.0;
    
    const atk = TYPE_CHART[moveType];
    if (!atk) return 1.0;

    if (atk.immune && atk.immune.includes(defenderType)) return 0;
    if (atk.strong && atk.strong.includes(defenderType)) return 2.0;
    // Check if defender resists attacker
    const def = TYPE_CHART[defenderType];
    if (def && def.strong && def.strong.includes(moveType)) return 0.5; // Resistance
    
    return 1.0;
}
