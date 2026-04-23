
// B"H
/**
 * @file fs.js
 * @brief The Node.js 'fs' module emulator allowing full synchronous disk I/O via SAB blocking.
 *
 * CHAPTER X: THE ENGRAVING OF THE TABLETS
 * 
 * Just as the Awtsmoos (Atzmus) forms reality from absolute Nothingness, 
 * sustaining it every instant through His Speech ("Forever, Lord, Your Word stands in the heavens"),
 * so too does this module simulate the physical act of engraving data onto the disk.
 * Through the miracle of SharedArrayBuffer (SAB), time itself stands still in the Worker 
 * while the Main Thread reaches into the depths of Asiyah (Action) to pull forth 
 * the requested file. This is the Seder Hishtalshelus (Chain of Emanation) in its purest 
 * form: the worker demands, the bridge blocks, the main thread manifests.
 * The word "fs" itself, when subjected to the holy transformations, echoes the structure 
 * of the universe—where every bit is a letter of the Divine Speech keeping inorganic 
 * reality in existence right now!
 */
export const fsModule = `
const { Buffer } = require('buffer');

module.exports = {
    /**
     * B"H
     * Halts time to retrieve the essence of a file.
     * @param {string} path - The coordinate to seek.
     * @param {string} [enc] - The garment of encoding.
     * @returns {string|Buffer} The manifested data.
     */
    readFileSync(path, enc) {
        const res = self._syncRead(path);
        if (res === null) throw new Error("ENOENT: no such file or directory, open '" + path + "'");
        const buf = Buffer.from(res);
        return enc ? buf.toString(enc) : buf;
    },
    
    /**
     * B"H
     * Instantly solidifies data into the physical realm.
     * @param {string} path - The coordinate.
     * @param {string|Buffer} data - The essence to write.
     * @param {object} [options] - Writing rules.
     */
    writeFileSync(path, data, options) {
        const content = typeof data === 'string' ? data : Buffer.from(data).toString();
        const err = self._syncWrite(path, content);
        if (err) throw new Error("EACCES: permission denied or write failed, write '" + path + "'");
    },
    
    /**
     * B"H
     * Probes the void to see if a vessel has manifested.
     * @param {string} path - The coordinate.
     * @returns {boolean} True if reality exists there.
     */
    existsSync(path) {
        return self._syncStat(path) === 'true';
    },
    
    /**
     * B"H
     * Retrieves the names of all sparks residing in a directory.
     * @param {string} path - The parent container.
     * @returns {string[]} The array of names.
     */
    readdirSync(path) {
        const res = self._syncList(path);
        if (res === null) throw new Error("ENOENT: no such file or directory, scandir '" + path + "'");
        try {
            return JSON.parse(res);
        } catch(e) {
            return [];
        }
    },
    
    promises: {
        readFile: async (path, enc) => module.exports.readFileSync(path, enc),
        writeFile: async (path, data, opts) => module.exports.writeFileSync(path, data, opts),
        readdir: async (path) => module.exports.readdirSync(path),
        access: async (path) => {
            if (!module.exports.existsSync(path)) throw new Error("ENOENT: no such file or directory, access '" + path + "'");
        }
    }
};
`;
