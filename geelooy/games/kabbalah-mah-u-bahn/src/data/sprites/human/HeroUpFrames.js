
/**
 * B"H
 * HeroUpFrames: Looking towards the Crown.
 * 
 * When the hero moves up, he shows his back to the lower worlds. 
 * This view emphasizes the Kippah and the strength of the shoulders.
 * 
 * @module src/data/sprites/human/HeroUpFrames
 */

const B = "O".repeat(64);
const HEAD_BACK = [
    "OOOOOOOOOOOOOOOOOOOOOOOOOOBBBBBBBBBBBBBBOOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOOBkkkkkkkkkkkkkkBBOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBkkkkkkkkkkkkkkkkkkBOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBkkkkkkkkkkkkkkkkkkBOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBkkkkkkkkkkkkkkkkkkBOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBkkkkkkkkkkkkkkkkkkBOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBkkkkkkkkkkkkkkkkkkBOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBkkkkkkkkkkkkkkkkkkBOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBkkkkkkkkkkkkkkkkkkBOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBkkkkkkkkkkkkkkkkkkBOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBkffffffffffffffffkBOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBkffffffffffffffffkBOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBkffffffffffffffffkBOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBBBBBBBBBBBBBBBBBBOOOOOOOOOOOOOOOOOOOOOO"
];

const BODY_BACK = [
    "OOOOOOOOOOOOOOOOOOOOBcccGGGGGGGGGGGGccBOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOBCccGGGGGGGGGGGGccBCOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOBccGGGGGGGGGGGGccBOOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOBccGGGGGGGGGGGGccBOOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOBBBBBBBBBBBBBBBBBBOOOOOOOOOOOOOOOOOOOOOOOO"
];

const generateFrame = (frameNum) => {
    const frame = [...Array(10).fill(B), ...HEAD_BACK, ...BODY_BACK];
    for (let i = 0; i < 15; i++) {
        let legs = "OOOOOOOOOOOOOOOOOOOOOOOOBB";
        const offset = Math.sin((frameNum / 6) * Math.PI * 2 + (i / 15)) * 4;
        legs += " ".repeat(Math.floor(8 + offset)) + "pppppp" + " ".repeat(Math.floor(8 - offset)) + "BB";
        frame.push(legs.padEnd(64, "O"));
    }
    return [...frame, ...Array(15).fill(B)];
};

export const HeroUpFrames = {
    HERO_U_F1: generateFrame(1),
    HERO_U_F2: generateFrame(2),
    HERO_U_F3: generateFrame(3),
    HERO_U_F4: generateFrame(4),
    HERO_U_F5: generateFrame(5),
    HERO_U_F6: generateFrame(6)
};
