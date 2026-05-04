
/**
 * B"H
 * FrameSynthesizer: Transforming and mirroring ASCII reality.
 * 
 * Chapter: The Mirror of Chochmah.
 * From the Right aspect, the Left aspect is born through simple reflection.
 * This class handles the mirroring of Otiot strings to ensure directional unity.
 */
export class FrameSynthesizer {
    /** 
     * Flips a 64x64 grid horizontally.
     * @param {Array<string>} matrix - Original ASCII frame.
     */
    static mirror(matrix) {
        return matrix.map(line => {
            return line.split('').reverse().join('');
        });
    }

    /** 
     * Darkens the matrix Otiot for shade levels.
     * @param {Array<string>} matrix
     */
    static overshadow(matrix) {
        return matrix.map(line => {
            // Mapping bright silk '^' to darker 'k'
            return line.replace(/\^/g, 'k');
        });
    }
}
