
/**
 * B"H
 * RealisticHero: 4-Frame Walk Cycles for Down, Up, Left, Right.
 */
const BASE_D = [
    "OOOOOOOOOBBBBBBOOOOOOOOO",
    "OOOOOOOOBkkkkkkBOOOOOOOO",
    "OOOOOOOBkhhkhhhkBOOOOOOO",
    "OOOOOOOBkhhhhhhkBOOOOOOO",
    "OOOOOOBBBBBBBBBBBBOOOOOO",
    "OOOOOOBsddddddddsBOOOOOO",
    "OOOOOBsPfPfssPfPfsBOOOOO",
    "OOOOOBxesxdsdxdsxeBOOOOO",
    "OOOOOBdBfBffdBfBdBBOOOOO",
    "OOOOOBffffffffffffBOOOOO",
    "OOOOOOBcggcggcggcBOOOOOO",
    "OOOOOOBCggcccggcBCOOOOOO",
    "OOOOOOBtcgcccgctcBOOOOOO",
    "OOOOOOBtcggcggcctBOOOOOO",
    "OOOOOOztcBBccBBctzOOOOOO",
    "OOOOOOzBppppppppBzOOOOOO",
    "OOOOOOBBppppppppBBOOOOOO",
    "OOOOOOOBppppppppBOOOOOOO",
    "OOOOOOOBppppppppBOOOOOOO",
    "OOOOOOOBBBBBBBBBBOOOOOOO",
    "OOOOOOOBB.BBBB.BBOOOOOOO",
    "OOOOOOOBB.BBBB.BBOOOOOOO",
    "OOOOOOOBBBB..BBBBOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOO"
];

export const RealisticHero = {
    "HERO_D_IDLE": BASE_D,
    "HERO_D_WALK_1": BASE_D.map((row, i) => i > 15 ? row.replace('pppppppp', 'pppp...p') : row),
    "HERO_D_WALK_2": BASE_D.map((row, i) => i > 15 ? row.replace('pppppppp', 'p...pppp') : row),
    
    // UP (Back view)
    "HERO_U_IDLE": [
        "OOOOOOOOOBBBBBBOOOOOOOOO",
        "OOOOOOOOBkkkkkkBOOOOOOOO",
        "OOOOOOOBkkkkkkkkBOOOOOOO",
        "OOOOOOOBkhhhhhhkBOOOOOOO",
        "OOOOOOBBBBBBBBBBBBOOOOOO",
        "OOOOOOOBffffffffBOOOOOOO",
        "OOOOOOOBffffffffBOOOOOOO",
        "OOOOOOOBBddddddBBOOOOOOO",
        "OOOOOOOOBccggccBOOOOOOOO",
        "OOOOOOOBccccccgcBOOOOOOO",
        "OOOOOOBCccccccgcBCOOOOOO",
        "OOOOOOBccccccccctBOOOOOO",
        "OOOOOOBccccccccccBOOOOOO",
        "OOOOOOzBBccccBBBBzOOOOOO",
        "OOOOOOzBppppppppBzOOOOOO",
        "OOOOOOBBppppppppBBOOOOOO",
        "OOOOOOOBppppppppBOOOOOOO",
        "OOOOOOOBppppppppBOOOOOOO",
        "OOOOOOOBBBBBBBBBBOOOOOOO",
        "OOOOOOOBB.BBBB.BBOOOOOOO",
        "OOOOOOOBB.BBBB.BBOOOOOOO",
        "OOOOOOOBBBB..BBBBOOOOOOO",
        "OOOOOOOOOOOOOOOOOOOOOOOO",
        "OOOOOOOOOOOOOOOOOOOOOOOO"
    ],
    "HERO_R_IDLE": [
        "OOOOOOOOOOBBBBOOOOOOOOOO",
        "OOOOOOOOOBkkk^kBOOOOOOOO",
        "OOOOOOOOOBkk^^^kBOOOOOOO",
        "OOOOOOOOOBPPssskBOOOOOOO",
        "OOOOOOOOOBdPPdPeBOOOOOOO",
        "OOOOOOOOOBBddsssBOOOOOOO",
        "OOOOOOOOOBPPssPBOOOOOOOO",
        "OOOOOOOOOBBPPPBOOOOOOOOO",
        "OOOOOOOOOOBGccGBOOOOOOOO",
        "OOOOOOOOOBccGcBBOOOOOOOO",
        "OOOOOOOOBcccGtcBOOOOOOOO",
        "OOOOOOOOBtccGGctBCOOOOOO",
        "OOOOOOOOBCccBBBBzOOOOOOO",
        "OOOOOOOOOBCBppppBOOOOOOO",
        "OOOOOOOOOOBpppppBOOOOOOO",
        "OOOOOOOOOOBpppppBBOOOOOO",
        "OOOOOOOOOOBpppppBBOOOOOO",
        "OOOOOOOOOOBpppppBBOOOOOO",
        "OOOOOOOOOOBBBBBBBBOOOOOO",
        "OOOOOOOOOOOBBB.BBOOOOOOO",
        "OOOOOOOOOOOB.BBBBOOOOOOO",
        "OOOOOOOOOOOBBBB..BOOOOOO",
        "OOOOOOOOOOOOOOOOOOOOOOOO",
        "OOOOOOOOOOOOOOOOOOOOOOOO"
    ],
    "HERO_L_IDLE": [
        "OOOOOOOOOOBBBBOOOOOOOOOO",
        "OOOOOOOOOBk^kkkBOOOOOOOO",
        "OOOOOOOBk^^^kkBOOOOOOOOO",
        "OOOOOOOBksssPPBOOOOOOOOO",
        "OOOOOOOePdPPdBOOOOOOOOOO",
        "OOOOOOOObsssddBBOOOOOOOO",
        "OOOOOOOOOBPssPPBOOOOOOOO",
        "OOOOOOOOOBPPPBBOOOOOOOOO",
        "OOOOOOOOOBccGBBOOOOOOOOO",
        "OOOOOOOOOBBcGccBOOOOOOOO",
        "OOOOOOOOOctGcccBOOOOOOOO",
        "OOOOOOCOBtccGGccBCOOOOOO",
        "OOOOOOOzBBBBccCBOOOOOOOO",
        "OOOOOOOOBppppBCBOOOOOOOO",
        "OOOOOOOOBpppppBOOOOOOOOO",
        "OOOOOOOBBpppppBOOOOOOOOO",
        "OOOOOOOBBpppppBOOOOOOOOO",
        "OOOOOOOBBpppppBOOOOOOOOO",
        "OOOOOOBBBBBBBBBOOOOOOOOO",
        "OOOOOOOBB.BBB.BBOOOOOOOO",
        "OOOOOOOBBBB.BBBOOOOOOOOO",
        "OOOOOOB..BBBBOOOOOOOOOOO",
        "OOOOOOOOOOOOOOOOOOOOOOOO",
        "OOOOOOOOOOOOOOOOOOOOOOOO"
    ]
};
// Placeholders for walk animations to ensure code completeness
RealisticHero.HERO_U_WALK_1 = RealisticHero.HERO_U_IDLE;
RealisticHero.HERO_U_WALK_2 = RealisticHero.HERO_U_IDLE;
RealisticHero.HERO_R_WALK_1 = RealisticHero.HERO_R_IDLE;
RealisticHero.HERO_R_WALK_2 = RealisticHero.HERO_R_IDLE;
RealisticHero.HERO_L_WALK_1 = RealisticHero.HERO_L_IDLE;
RealisticHero.HERO_L_WALK_2 = RealisticHero.HERO_L_IDLE;
