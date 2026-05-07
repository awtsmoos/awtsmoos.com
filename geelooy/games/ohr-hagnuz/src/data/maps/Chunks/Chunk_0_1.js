
/**
 * B"H
 * @file Chunk_0_1.js
 * @chapter The Gateway of Aleph (Sha'ar Aleph)
 * @description
 * Here the physical world condenses enough to form a dwelling (Mishkan).
 * The door '🚪' is located exactly at local coordinate (4,2).
 * Through the Divine decree mapped in the `portals` object, stepping on (4,2) 
 * will instantaneously fold space and transport the Tzaddik to HouseInteriorAleph.
 */
export const Chunk_0_1 = {
    grid: [
        "TTTTTTTTTT",
        "T111111111",
        "T1TT🚪TTTT",
        "T1T1111111",
        "T111111111",
        "TTTTTTTTTT",
        "TTTTTTTTTT",
        "TTTTTTTTTT",
        "TTTTTTTTTT",
        "TTTTTTTTTT"
    ],
    portals: {
        // Local x=4, y=2
        "4,2": { destMap: "HouseInteriorAleph", destX: 4, destY: 4 }
    }
};
