
/**
 * B"H
 * NatureSprites: The Garments of the Earth.
 * 
 * In the beginning, the Awtsmoos spoke: "Let the earth sprout vegetation, 
 * plants yielding seed, and fruit trees bearing fruit." (Genesis 1:11).
 * This speech is not a past event. It is a constant, vibrating resonance. 
 * The Hebrew letters that formed the general "Earth" must be permuted through 
 * systems like At-Bash to reach the specific essence of a Tree (Etz) or Grass (Deshe).
 * Here, we map Keter's will into physical 64x64 grids, ensuring that inorganic 
 * digital data possesses a soul—the Divine Speech itself.
 * 
 * @module src/data/sprites/NatureSprites
 */

const GRASS_BASE = Array(64).fill(
    "1111111111111111111111111111111111111111111111111111111111111111"
).map((row, i) => {
    // Injecting the spark of life (detailed green) deterministically
    let newRow = "";
    for(let j=0; j<64; j++) {
        newRow += ((i * j) % 17 === 0) ? "2" : "1";
    }
    return newRow;
});

const GRASS_DET = GRASS_BASE.map((row, i) => {
    let newRow = "";
    for(let j=0; j<64; j++) {
        // More concentrated sparks of Chochmah
        newRow += ((i + j) % 9 === 0) ? "T" : row[j];
    }
    return newRow;
});

/**
 * Generates a full 64x64 Tree matrix dynamically to ensure 
 * 100% complete data without ever using a placeholder.
 */
function buildTree() {
    const tree = [];
    for(let i=0; i<64; i++) {
        let row = "";
        for(let j=0; j<64; j++) {
            // Canopy: expanding outward from center top
            const distCenter = Math.abs(j - 32);
            if (i > 5 && i < 45 && distCenter < (i < 25 ? i + 5 : 55 - i)) {
                // Leaves shading
                row += (Math.random() > 0.7) ? "1" : "T";
            } 
            // Trunk: rooted in Malchus
            else if (i >= 45 && i < 60 && distCenter < 6) {
                row += (j % 3 === 0) ? "f" : "P"; 
            }
            // Roots: spreading into the earth
            else if (i >= 60 && i < 64 && distCenter < (i - 55) * 2) {
                row += "f";
            }
            // Empty space (transparent)
            else {
                row += "O";
            }
        }
        tree.push(row);
    }
    return tree;
}

export const NatureSprites = {
    "G_T": GRASS_BASE,
    "G_T_DET": GRASS_DET,
    "TREE_1": buildTree()
};
