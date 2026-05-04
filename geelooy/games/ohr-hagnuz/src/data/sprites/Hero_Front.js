
/**
 * B"H
 * Hero_Front: High-Realism Frontal Gait.
 * The 4 letters of the Divine Name correspond to the 4 directions of space.
 */
const HEAD = [
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

const TORSO = [
    "OOOOOOBcggcggcggcBOOOOOO",
    "OOOOOOBCggcccggcBCOOOOOO",
    "OOOOOOBtcgcccgctcBOOOOOO",
    "OOOOOOBtcggcggcctBOOOOOO",
    "OOOOOOztcBBccBBctzOOOOOO"
];

export const Hero_Front = {
    "HERO_D_FRAME_1": [...HEAD, ...TORSO, "OOOOOOzBppppppppBzOOOOOO", "OOOOOOBBppppppppBBOOOOOO", "OOOOOOOBppppppppBOOOOOOO", "OOOOOOOBBBBBBBBBBOOOOOOO", "OOOOOOOOOB..BB..OOOOOOOO"],
    "HERO_D_FRAME_2": [...HEAD, ...TORSO, "OOOOOOzBpppppp..BzOOOOOO", "OOOOOOBBpppppB..BBOOOOOO", "OOOOOOOBppppB...BOOOOOOO", "OOOOOOOBBBBBB...BOOOOOOO", "OOOOOOOOOB......OOOOOOOO"],
    "HERO_D_FRAME_3": [...HEAD, ...TORSO, "OOOOOOzBppppppppBzOOOOOO", "OOOOOOBBppppppppBBOOOOOO", "OOOOOOOBppppppppBOOOOOOO", "OOOOOOOBBBBBBBBBBOOOOOOO", "OOOOOOOOOB..BB..OOOOOOOO"],
    "HERO_D_FRAME_4": [...HEAD, ...TORSO, "OOOOOOzB..ppppppBzOOOOOO", "OOOOOOBB..pppppBBOOOOOOO", "OOOOOOOB...ppppBBOOOOOOO", "OOOOOOOB...BBBBBBOOOOOOO", "OOOOOOOO......BBOOOOOOOO"]
};
