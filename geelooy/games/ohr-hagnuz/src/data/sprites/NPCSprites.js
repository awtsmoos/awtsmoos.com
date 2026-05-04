
/**
 * B"H
 * NPCSprites: The Souls of the Righteous.
 * 
 * Just as every rock requires the constant enclothement of Divine Speech,
 * the NPC represents an interactive soul, a vessel for transmitting 
 * Torah and guidance. The white beard represents the Thirteen Attributes 
 * of Mercy flowing downward into the finite realm.
 * 
 * @module src/data/sprites/NPCSprites
 */

const SAGE_HEAD = [
    "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOOOOBBBBBBBBBBBBBBOOOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOOBBkkkkkkkkkkkkkkBBOOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBkkk^^^^^^^^^^^^kkkBOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBkkk^^^^^^^^^^^^kkkBOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBkkkkkkkkkkkkkkkkkkBOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBssssssssssssssssssBOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOBBssddddddddddddddssBBOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOBseeeeeeexxeeeeeeexxsBOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOBseeeeeeexxeeeeeeexxsBOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOBsddddddddddddddddddssBBOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOBcffffffffffffffffffcBOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOBccccccccccccccccccccBOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOBBccccccccccccccccBBOOOOOOOOOOOOOOOOOOOOO",
    "OOOOOOOOOOOOOOOOOOOOOOOOBBccccccccccccccBBOOOOOOOOOOOOOOOOOOOOOO"
];

const SAGE_BODY = [];
for (let i = 0; i < 30; i++) {
    // Flowing blue/grey robes with the white beard overlapping
    let row = "OOOOOOOOOOOOOOOOOOOOBB";
    for (let j = 22; j < 42; j++) {
        // Beard logic (center white)
        if (j > 26 && j < 38 && i < 15) {
            row += "c"; // White beard
        } else {
            row += (j % 2 === 0) ? "q" : "p"; // Robe texture
        }
    }
    row += "BBOOOOOOOOOOOOOOOOOOOO";
    SAGE_BODY.push(row);
}

const SAGE_FEET = [];
for(let i=0; i<17; i++) {
    if (i < 10) {
        SAGE_FEET.push("OOOOOOOOOOOOOOOOOOOOBBqqqqqqqqqqqqqqqqqqqqBBOOOOOOOOOOOOOOOOOOOO");
    } else if (i < 15) {
        SAGE_FEET.push("OOOOOOOOOOOOOOOOOOOOBBBBBqqqqqqqqqqqqqqBBBBBOOOOOOOOOOOOOOOOOOOO");
    } else {
        SAGE_FEET.push("OOOOOOOOOOOOOOOOOOOOOOOOBBBBBBBBBBBBBBBBOOOOOOOOOOOOOOOOOOOOOOOO");
    }
}

export const NPCSprites = {
    "NPC_SAGE": [...SAGE_HEAD, ...SAGE_BODY, ...SAGE_FEET]
};
