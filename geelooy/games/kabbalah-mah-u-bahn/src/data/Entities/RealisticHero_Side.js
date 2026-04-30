
/**
 * B"H
 * RealisticHero_Side: The Lateral Aspect of the Hero.
 * 
 * Chapter: The Mirror of the Mind.
 * In this chapter, our hero turns his gaze towards the horizons of Asiyah.
 * His movement is a vibration of hebrew letters shifting in At-Bash sequence
 * to produce the illusion of physical space.
 * 
 * @module src/data/Entities/RealisticHero_Side
 */

const HEAD_R = [
    "OOOOOOOOOOOOOOOOBBBBBBBOOOOOOOOO",
    "OOOOOOOOOOOOOOBkkkkkkkkBOOOOOOOO",
    "OOOOOOOOOOOOOBk^^^^^^^^kBOOOOOOO",
    "OOOOOOOOOOOOOBk^kkkkkk^kBOOOOOOO",
    "OOOOOOOOOOOOOBPssssssssPBOOOOOOO",
    "OOOOOOOOOOOOOBdeexxxxeedBOOOOOOO",
    "OOOOOOOOOOOOOBssssssssssBOOOOOOO",
    "OOOOOOOOOOOOOBPPssssssPPBOOOOOOO",
    "OOOOOOOOOOOOOBffffffffffBOOOOOOO",
    "OOOOOOOOOOOOOOBBBBBBBBBBOOOOOOOO"
];

const TORSO_R = [
    "OOOOOOOOOOOOOBccGGccGGccBOOOOOOO",
    "OOOOOOOOOOOOBCccGGGGGGccBCOOOOOO",
    "OOOOOOOOOOOOOBccGGGGGGGGccBOOOOO",
    "OOOOOOOOOOOOOBcccGGGGGGcccctOOOO",
    "OOOOOOOOOOOOOBzcczzcczzcczzcOOOO",
    "OOOOOOOOOOOOOBBBBBppppppBBBBOOOO"
];

/**
 * Hyper-Realistic gait frames for Rightward movement.
 * Mirroring these frames produces the Leftward manifestation.
 * 
 * @constant {Object} SideWalkFrames
 */
export const RealisticHero_Side = {
    "HERO_R_F1": [...HEAD_R, ...TORSO_R, 
        "OOOOOOOOOOOOOOBBppppppBOOOOOOOOO",
        "OOOOOOOOOOOOOOBBppppppBBOOOOOOOO",
        "OOOOOOOOOOOOOOBBpppppBBOOOOOOOOO",
        "OOOOOOOOOOOOOOBBBBBBBBBOOOOOOOOO"
    ],
    "HERO_R_F2": [...HEAD_R, ...TORSO_R, 
        "OOOOOOOOOOOOOO...ppppBBOOOOOOOOO",
        "OOOOOOOOOOOOOO...ppppBBOOOOOOOOO",
        "OOOOOOOOOOOOOO...BBBBBOOOOOOOOOO",
        "OOOOOOOOOOOOOO......BBOOOOOOOOOO"
    ],
    "HERO_R_F3": [...HEAD_R, ...TORSO_R, 
        "OOOOOOOOOOOOOOBBppppppBOOOOOOOOO",
        "OOOOOOOOOOOOOOBBppppppBBOOOOOOOO",
        "OOOOOOOOOOOOOOBBpppppBBOOOOOOOOO",
        "OOOOOOOOOOOOOOBBBBBBBBBOOOOOOOOO"
    ],
    "HERO_R_F4": [...HEAD_R, ...TORSO_R, 
        "OOOOOOOOOOOOOOppppB...BOOOOOOOOO",
        "OOOOOOOOOOOOOOppppB...BOOOOOOOOO",
        "OOOOOOOOOOOOOOBBBB...OOOOOOOOOOO",
        "OOOOOOOOOOOOOOBB......OOOOOOOOOO"
    ]
};

const flipRow = (row) => row.split('').reverse().join('').replace(/\^/g, '^'); // Mirror logic

/** Generate Left from Right dynamically to ensure unity. */
[1, 2, 3, 4].forEach(idx => {
    RealisticHero_Side[`HERO_L_F${idx}`] = RealisticHero_Side[`HERO_R_F${idx}`].map(flipRow);
});
