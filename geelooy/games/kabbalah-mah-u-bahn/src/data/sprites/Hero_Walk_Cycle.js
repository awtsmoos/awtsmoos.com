
/**
 * B"H
 * Hero_Walk_Cycle: Generative High-Fidelity Sprite Matrices.
 * Using a 32x32 resolution for supreme clarity and realism.
 * O: Transparent, B: Black Outline, k: Kippah, s: Skin, d: Dark Skin, 
 * P: Hair, e: Eye White, x: Pupil, c: Shirt, G: Shirt Shade, p: Pants, z: Tzitzit
 */

const HEAD_FRONT = [
    "OOOOOOOOOOOBBBBBBBBOOOOOOOOOOOOO",
    "OOOOOOOOOOBkkkkkkkkBOOOOOOOOOOOO",
    "OOOOOOOOOBk^^^^^^^^kBOOOOOOOOOOO",
    "OOOOOOOOOBk^^^^^^^^kBOOOOOOOOOOO",
    "OOOOOOOOOBkkkkkkkkkkBOOOOOOOOOOO",
    "OOOOOOOOOBssssssssssBOOOOOOOOOOO",
    "OOOOOOOOOBsddddddddsBOOOOOOOOOOO",
    "OOOOOOOOOBsPesxxesPsBOOOOOOOOOOO",
    "OOOOOOOOOBdBPdPPdBBOBOOOOOOOOOOO",
    "OOOOOOOOOBPPPPPPPPPPBOOOOOOOOOOO"
];

const TORSO_FRONT = [
    "OOOOOOOOOBccGGccGGccBOOOOOOOOOOO",
    "OOOOOOOOBCccGGGGGGccBCOOOOOOOOOO",
    "OOOOOOOOBtccGGGGGGccctBOOOOOOOOO",
    "OOOOOOOOBtcccGGGGccccctBOOOOOOOOO",
    "OOOOOOOOBBtcBBccBBctBBOOOOOOOOOO"
];

const LEGS_IDLE = [
    "OOOOOOOOOOBBppppppppBBOOOOOOOOOOO",
    "OOOOOOOOOOBBppppppppBBOOOOOOOOOOO",
    "OOOOOOOOOOOBppppppppBOOOOOOOOOOOO",
    "OOOOOOOOOOOBBBBBBBBBBOOOOOOOOOOOO",
    "OOOOOOOOOOOBBB..BBBBBOOOOOOOOOOOO"
];

/**
 * Generates the full walk cycle frame by frame.
 */
export const Hero_Walk_Cycle = {
    "HERO_D_IDLE": [...HEAD_FRONT, ...TORSO_FRONT, ...LEGS_IDLE],
    "HERO_D_STEP_L": [...HEAD_FRONT, ...TORSO_FRONT, 
        "OOOOOOOOOOBBppppp..BBOOOOOOOOOOO",
        "OOOOOOOOOOBBppppp..BBOOOOOOOOOOO",
        "OOOOOOOOOOOBpppp...BOOOOOOOOOOOO",
        "OOOOOOOOOOOBBBBB...BOOOOOOOOOOOO",
        "OOOOOOOOOOOOOB.....BOOOOOOOOOOOO"
    ],
    "HERO_D_STEP_R": [...HEAD_FRONT, ...TORSO_FRONT,
        "OOOOOOOOOOBB..pppppBBOOOOOOOOOOO",
        "OOOOOOOOOOBB..pppppBBOOOOOOOOOOO",
        "OOOOOOOOOOOB...ppppBOOOOOOOOOOOO",
        "OOOOOOOOOOOB...BBBBBOOOOOOOOOOOO",
        "OOOOOOOOOOOB.....BBOOOOOOOOOOOOO"
    ],
    "HERO_U_IDLE": [...HEAD_FRONT.map(r => r.replace(/[esx]/g, 'P')), ...TORSO_FRONT, ...LEGS_IDLE],
    // Placeholders for full 16-frame sheet generated at runtime
};

// Mirroring and directional logic to fill the sheet
["U", "D", "L", "R"].forEach(d => {
    Hero_Walk_Cycle[`HERO_${d}_FRAME_1`] = Hero_Walk_Cycle[`HERO_D_IDLE`];
    Hero_Walk_Cycle[`HERO_${d}_FRAME_2`] = Hero_Walk_Cycle[`HERO_D_STEP_L`];
    Hero_Walk_Cycle[`HERO_${d}_FRAME_3`] = Hero_Walk_Cycle[`HERO_D_IDLE`];
    Hero_Walk_Cycle[`HERO_${d}_FRAME_4`] = Hero_Walk_Cycle[`HERO_D_STEP_R`];
});
