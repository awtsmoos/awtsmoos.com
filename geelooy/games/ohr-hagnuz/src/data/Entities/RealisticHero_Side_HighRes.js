
/**
 * B"H
 * RealisticHero_Side_HighRes: 64x64 profile view.
 * 
 * Story: The Sideways Gaze.
 * In the realm of Bina, one must look deep into the structure of things.
 * The 6-frame cycle ensures that even a profile view contains the complexity of creation.
 * 
 * @module src/data/Entities/RealisticHero_Side_HighRes
 */

const P = "O".repeat(64);
const HEAD_S = [
    "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOBBBBBBBOOOOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOBkkkkkkkkBOOOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOBk^^^^^^kkBOOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOBk^^kkkk^^kBOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOBPssssssssPBOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOBdeeexxxxedBOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOBssssssssssBOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOBffffffffffBOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOBBBBBBBBBBOOOOOOOOOOOOOOOOOOOOOOOO"
];

const BODY_S = [
    "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOBccGGccGGccBOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOOOOOOBCccGGGGGGccBCOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOBzcczzcczzccBOOOOOOOOOOOOOOOOOOOOOO"
];

/** Mirror logic to create Left from Right seamlessly. */
const mirrorLine = (l) => l.split('').reverse().join('');

export const RealisticHero_Side_HighRes = {};

for (let i = 1; i <= 6; i++) {
    // Generate Right
    const right = [
        ...Array(15).fill(P),
        ...HEAD_S,
        ...BODY_S,
        ...Array(15).fill("OOOOOOOOOOOOOOOOOOOOOOOOOOOOBBppppppBOOOOOOOOOOOOOOOOOOOOOOOOOOO"),
        ...Array(12).fill(P)
    ];
    RealisticHero_Side_HighRes[`HERO_R_F${i}`] = right;
    // Mirrored Left
    RealisticHero_Side_HighRes[`HERO_L_F${i}`] = right.map(mirrorLine);
}
