
/**
 * B"H
 * Hero_Down: High-Realism Walk Cycle (Down).
 * 24x24 detailed matrices.
 */
const HEAD_D = [
    "OOOOOOOOOBBBBBBOOOOOOOOO",
    "OOOOOOOOBkkkkkkBOOOOOOOO",
    "OOOOOOOBkhhkhhhkBOOOOOOO",
    "OOOOOOOBkhhhhhhkBOOOOOOO",
    "OOOOOOBBBBBBBBBBBBOOOOOO",
    "OOOOOOBsddddddddsBOOOOOO",
    "OOOOOBsPfPfssPfPfsBOOOOO",
    "OOOOOBxesxdsdxdsxeBOOOOO",
    "OOOOOBdBfBffdBfBdBBOOOOO",
    "OOOOOBffffffffffffBOOOOO"
];

const TORSO_D = [
    "OOOOOOBcggcggcggcBOOOOOO",
    "OOOOOOBCggcccggcBCOOOOOO",
    "OOOOOOBtcgcccgctcBOOOOOO",
    "OOOOOOBtcggcggcctBOOOOOO",
    "OOOOOOztcBBccBBctzOOOOOO"
];

export const Hero_Down = {
    "HERO_D_IDLE": [...HEAD_D, ...TORSO_D,
        "OOOOOOzBppppppppBzOOOOOO", "OOOOOOBBppppppppBBOOOOOO", "OOOOOOOBppppppppBOOOOOOO", "OOOOOOOBBBBBBBBBBOOOOOOO", "OOOOOOOOOB..BB..OOOOOOOO"
    ],
    "HERO_D_WALK_1": [...HEAD_D, ...TORSO_D,
        "OOOOOOzBpppppp..BzOOOOOO", "OOOOOOBBpppppB..BBOOOOOO", "OOOOOOOBppppB...BOOOOOOO", "OOOOOOOBBBBBB...BOOOOOOO", "OOOOOOOOOB......OOOOOOOO"
    ],
    "HERO_D_WALK_2": [...HEAD_D, ...TORSO_D,
        "OOOOOOzB..ppppppBzOOOOOO", "OOOOOOBB..pppppBBOOOOOOO", "OOOOOOOB...ppppBBOOOOOOO", "OOOOOOOB...BBBBBBOOOOOOO", "OOOOOOOO......BBOOOOOOOO"
    ]
};
