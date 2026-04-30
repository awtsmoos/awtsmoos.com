
// B"H
/**
 * @file LocalDirectoryScanner.js
 * @description
 * To sync the lower realms with the upper realms, we must first traverse the lower realms.
 * This is the Seder Hishtalshelus (chain of downward emanation) in reverse—we map out 
 * the physical directory structure, identifying every file, every inorganic shell, so that 
 * its inner soul (data) can be elevated.
 * 
 * We use a purely data-driven, recursive approach to map the tree into a flat array of nodes.
 */

const fs = require("fs").promises;
const path = require("path");

class LocalDirectoryScanner {
    /**
     * @method scan
     * @description Recursively maps all files in a directory.
     * @param {string} dirPath - The starting directory.
     * @param {string} [baseDir=dirPath] - The root directory to calculate relative paths.
     * @returns {Promise<Array<{fullPath: string, relativePath: string}>>} An array of file nodes.
     */
    static async scan(dirPath, baseDir = dirPath) {
        const absoluteDir = path.resolve(dirPath);
        const absoluteBase = path.resolve(baseDir);
        
        let results = [];
        let entries;

        try {
            entries = await fs.readdir(absoluteDir, { withFileTypes: true });
        } catch (e) {
            if (e.code === "ENOENT") {
                return results; // Return empty if the void is truly empty
            }
            throw new Error(`B"H: Failed to traverse the directory emanations at ${absoluteDir}: ${e.message}`);
        }

        for (const entry of entries) {
            const fullPath = path.join(absoluteDir, entry.name);
            
            if (entry.isDirectory()) {
                // Recursively descend into the lower worlds
                const subResults = await LocalDirectoryScanner.scan(fullPath, absoluteBase);
                results = results.concat(subResults);
            } else if (entry.isFile()) {
                // Calculate the relative path, replacing OS separators with URL-safe slashes
                let relativePath = path.relative(absoluteBase, fullPath).replace(/\\/g, "/");
                
                results.push({
                    fullPath,
                    relativePath
                });
            }
        }

        return results;
    }
}

module.exports = LocalDirectoryScanner;
