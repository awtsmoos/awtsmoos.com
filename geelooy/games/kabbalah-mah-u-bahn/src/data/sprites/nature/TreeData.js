
/**
 * B"H
 * TreeData: The Pillars of the Garden.
 * 
 * Chapter: The Vertical Ascent.
 * A tree is a bridge between the Earth (Malchut) and the Heavens (Zeir Anpin). 
 * Its roots dig deep into the mysteries, while its branches reach for the Ein Sof. 
 * This 64x64 matrix is a vessel for the Word 'Etz'. Every pixel is a calculated 
 * placement of light and shadow, ensuring that the form is robust and 
 * honors the Seder Histalshelus of organic geometry.
 * 
 * @module src/data/sprites/nature/TreeData
 */

/**
 * Generates the physical form of a tree through logic-based canopy growth.
 * @returns {Array<string>} 64x64 ASCII representation.
 */
const generateTree = () => {
    const matrix = [];
    for (let y = 0; y < 64; y++) {
        let row = "";
        for (let x = 0; x < 64; x++) {
            const dx = Math.abs(x - 32);
            // The Trunk (Foundation/Yesod)
            if (y > 40 && y < 60 && dx < 5) {
                row += (x % 2 === 0) ? "P" : "f";
            } 
            // The Canopy (Expansion/Chesed-Gevurah)
            else if (y <= 40 && y > 5) {
                const canopyWidth = Math.sin((y / 40) * Math.PI) * 28;
                if (dx < canopyWidth) {
                    const leafNoise = (x * y + x) % 5;
                    row += (leafNoise > 2) ? "T" : "1";
                } else {
                    row += "O";
                }
            }
            // The Roots (Malchut Grounding)
            else if (y >= 60 && dx < (y - 58) * 3) {
                row += "f";
            }
            else {
                row += "O";
            }
        }
        matrix.push(row);
    }
    return matrix;
};

export const TreeData = {
    /** The primary botanical sentinel. */
    OAK_PRIMARY: generateTree()
};
