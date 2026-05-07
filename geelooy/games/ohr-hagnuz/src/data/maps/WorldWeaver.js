
/**
 * B"H
 * @file WorldWeaver.js
 * @class WorldWeaver
 * @chapter The Unification (Yichud) of Fragments
 * @description
 * In Kabbalah, Tikkun (Rectification) involves gathering the shattered 
 * fragments of Tohu and weaving them into the unified Visage (Partzuf).
 * 
 * This pure function takes a 2D matrix of String Arrays (Chunks) and concatenates 
 * them flawlessly into one massive, unified 2D String Array. No coordinate math. 
 * The unique Portal Characters (☗, ★) simply retain their existence in the unified grid.
 */
export class WorldWeaver {
    /**
     * @param {Array<Array<Array<string>>>} chunkMatrix - 2D layout of Chunks.
     * @returns {Array<string>} The unified map array.
     */
    static weave(chunkMatrix) {
        let wovenGrid = [];
        
        for (let r = 0; r < chunkMatrix.length; r++) {
            let rowChunks = chunkMatrix[r];
            let rowHeight = rowChunks[0].length;
            
            // Create empty strings for this horizontal band of chunks
            let currentBand = Array(rowHeight).fill("");
            
            for (let c = 0; c < rowChunks.length; c++) {
                let chunk = rowChunks[c];
                
                // Append each line of the chunk to the correct line in the band
                for (let i = 0; i < rowHeight; i++) {
                    currentBand[i] += chunk[i];
                }
            }
            
            // Push the fully concatenated band into the final world
            wovenGrid.push(...currentBand);
        }
        
        return wovenGrid;
    }
}
