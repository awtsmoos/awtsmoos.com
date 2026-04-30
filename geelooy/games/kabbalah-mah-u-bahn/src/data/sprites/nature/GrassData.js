
/**
 * B"H
 * GrassData: The Tapestry of the Field.
 * 
 * Chapter: The Breath of the Earth.
 * It is taught in the holy books that every single blade of grass has an 
 * angel above it that strikes it and says, "Grow!" This "striking" is 
 * the infusion of the Divine Word 'Deshe' (Grass) into the physical 
 * matter of Asiyah. Here, we define the base 64x64 matrices that represent 
 * the lush greenery of the world, varying the sparks of light to 
 * simulate organic depth.
 * 
 * @module src/data/sprites/nature/GrassData
 */

/**
 * Creates a 64x64 matrix of grass tiles based on deterministic patterns.
 * @param {number} sparkFrequency - How often a detail pixel appears.
 * @returns {Array<string>} 64 lines of 64 characters.
 */
const generateGrass = (sparkFrequency) => {
    const lines = [];
    for (let y = 0; y < 64; y++) {
        let row = "";
        for (let x = 0; x < 64; x++) {
            // Logic based on prime remainders to ensure a "natural" feel
            const noise = (x * 31 + y * 17) % sparkFrequency;
            if (noise === 0) row += "2";      // Darker blade
            else if (noise === 1) row += "T"; // Sentinel green
            else row += "1";                  // Base grass
        }
        lines.push(row);
    }
    return lines;
};

export const GrassData = {
    /** The standard carpet of Asiyah. */
    BASE: generateGrass(13),
    /** Dense, detailed patches where the light is more concentrated. */
    DETAILED: generateGrass(7)
};
