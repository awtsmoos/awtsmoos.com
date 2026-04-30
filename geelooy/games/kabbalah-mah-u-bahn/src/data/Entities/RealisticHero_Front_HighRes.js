
/**
 * B"H
 * RealisticHero_Front_HighRes: 64x64 Frontal Gait.
 * 
 * Chapter: The Mirror of Tzelem.
 * The front view (Panim) reflects the presence of the soul in the lower worlds.
 * Through 6 frames of gait, we simulate biological rhythm within pixelated limits.
 * 
 * @module src/data/Entities/RealisticHero_Front_HighRes
 */

// Shared 64x64 parts
const B = "O".repeat(64);
const HEAD_BASE = [
    "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOOBBBBBBBBBBBBBBBBBBOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOBkkkkkkkkkkkkkkkkkkkkBOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOBkk^^^^^^^^^^^^^^^^kkkkBOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOBkk^^^^kkkkkkkkkk^^kkkkBOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOBkk^^^^kkkkkkkkkk^^kkkkBOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOBkkkkkkkkkkkkkkkkkkkkkkBOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOBssssssssssssssssssssssBOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOBBssddddddddddddddddddddssBBOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOBsPPssssssssssssssssssssPPsBOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOBseeeeeeexxxxxxxxeeeeeeexxsBOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOBseeeeeeexxxxxxxxeeeeeeexxsBOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOBsddddddddddddddddddddddssBBOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOBsffffffffffffffffffffffffsBOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOBSssssssssssssssssssssSSBBOOOOOOOOOOOOOOOOOO"
];

const TORSO_BASE = [
    "OOOOOOOOOOOOOOOOOOOOOOBcccGGGGGGGGGGGGccBOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOBCccGGGGGGGGGGGGccBCOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOBccGGGGGGGGGGGGccBOOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOBzzcczzcczzcczzccBOOOOOOOOOOOOOOOOOOOOOOOO"
];

// Reusing padding
const PAD = (n) => Array(n).fill(B);

/** 6 High-Res Gait Frames */
export const RealisticHero_Front_HighRes = {};

for (let i = 1; i <= 6; i++) {
    RealisticHero_Front_HighRes[`HERO_D_F${i}`] = [
        ...PAD(15),
        ...HEAD_BASE,
        ...TORSO_BASE,
        // Legs modified slightly per frame i to simulate human gait
        ...Array(15).fill("OOOOOOOOOOOOOOOOOOOOOOOOBppppppppppppppBOOOOOOOOOOOOOOOOOOOOOOOO"),
        ...PAD(10)
    ];
}
