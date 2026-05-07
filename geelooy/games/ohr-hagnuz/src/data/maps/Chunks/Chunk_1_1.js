
/**
 * B"H
 * @file Chunk_1_1.js
 * @chapter The Gateway of Beis (Sha'ar Beis)
 * @description
 * The second dwelling. The door '⛩️' is stationed at local (4,2).
 * When the WorldWeaver stitches these chunks together, it will dynamically 
 * calculate the global coordinate of this door so that the PortalValidator 
 * never fails. The Awtsmoos leaves no broken links in the chain of reality.
 */
export const Chunk_1_1 = {
    grid: [
        "TTTTTTTTTT",
        "111111111T",
        "TTTT⛩️TTTT",
        "111111111T",
        "111111111T",
        "TTTTTTTTTT",
        "TTTTTTTTTT",
        "TTTTTTTTTT",
        "TTTTTTTTTT",
        "TTTTTTTTTT"
    ],
    portals: {
        // Local x=4, y=2
        "4,2": { destMap: "HouseInteriorBeis", destX: 4, destY: 4 }
    }
};
