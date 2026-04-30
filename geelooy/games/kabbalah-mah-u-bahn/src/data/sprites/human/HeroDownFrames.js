
/**
 * B"H
 * HeroDownFrames: The Descent of the Soul.
 * 
 * Story: The Traveler in Malchut.
 * As the hero moves downward, he faces the full complexity of the 
 * physical realm. These frames capture the shifting of weight, 
 * the swinging of arms, and the pulse of life. Each frame is 
 * exactly 64x64, a perfect vessel for the high-resolution gait.
 * 
 * @module src/data/sprites/human/HeroDownFrames
 */

const B = "O".repeat(64);
const HEAD = [
    "OOOOOOOOOOOOOOOOOOOOOOOOOOBBBBBBBBBBBBBBOOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOOBkkkkkkkkkkkkkkBBOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBkk^^^^^^^^^^^^kkkBOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBkk^^^^kkkkkk^^kkkBOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBkk^^^^kkkkkk^^kkkBOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBkkkkkkkkkkkkkkkkkkBOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBssssssssssssssssssBOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOBBssddddddddddddddssBBOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOBsPPssPPssPPssPPssPPsBOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOBseexxxxeexxeexxxxeexsBOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOBseexxxxeexxeexxxxeexsBOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOBsddddddddddddddddddssBBOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOBsffffffffffffffffffssBOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOBsffffffffffffffffffssBOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBBssssssssssssssssBBOOOOOOOOOOOOOOOOOOOOO"
];

const BODY = [
    "OOOOOOOOOOOOOOOOOOOOBcccGGGGGGGGGGGGccBOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOBCccGGGGGGGGGGGGccBCOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOBccGGGGGGGGGGGGccBOOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOBzzcczzcczzcczzcczzBOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOBBBBBBBBBBBBBBBBBBOOOOOOOOOOOOOOOOOOOOOOOO"
];

const generateFrame = (frameNum) => {
    const frame = [...Array(10).fill(B), ...HEAD, ...BODY];
    // Walking leg logic
    for (let i = 0; i < 15; i++) {
        let legs = "OOOOOOOOOOOOOOOOOOOOOOOOBB";
        const offset = Math.sin((frameNum / 6) * Math.PI * 2 + (i / 15)) * 4;
        legs += " ".repeat(Math.floor(8 + offset)) + "pppppp" + " ".repeat(Math.floor(8 - offset)) + "BB";
        frame.push(legs.padEnd(64, "O"));
    }
    return [...frame, ...Array(10).fill(B)];
};

export const HeroDownFrames = {
    HERO_D_F1: generateFrame(1),
    HERO_D_F2: generateFrame(2),
    HERO_D_F3: generateFrame(3),
    HERO_D_F4: generateFrame(4),
    HERO_D_F5: generateFrame(5),
    HERO_D_F6: generateFrame(6)
};
