
// B"H
/**
 * @file AwtsmoosContentExtractor.js
 * @description
 * "He who brings forth bread from the earth." 
 * 
 * We have encountered sparks that wear deceptive garments. A file named `.json` 
 * may actually contain the pure binary essence of the Awtsmoos (`Aj`). 
 * 
 * If we try to feed this profound binary essence into earthly `JSON.parse()`, 
 * the letters rebel and shatter the process ("Unexpected token A"). 
 * We have evolved the `.json` strategy to first check if the spark is actually 
 * an Awtsmoos Object in disguise. If standard extraction fails, we return the raw 
 * buffer as a safeguard, refusing to let a single rebellious file stop the Aliyah.
 */

const fs = require("fs").promises;
const path = require("path");
// B"H: Pointing directly to the modular binary engine index
const awtsmoosBinary = require("../../awtsmoosBinaryJSON/index.js"); 

/**
 * Data map of extraction logic.
 */
const ExtractionStrategies = {
    ".awtsmoosJSON": async (fullPath) => {
        const buffer = await fs.readFile(fullPath);
        return await awtsmoosBinary.deserializeBinary(buffer);
    },
    ".awts": async (fullPath) => {
        const buffer = await fs.readFile(fullPath);
        return await awtsmoosBinary.deserializeBinary(buffer);
    },
    ".json": async (fullPath) => {
        const buffer = await fs.readFile(fullPath);
        
        // B"H: The Discernment Check. 
        // Sometimes a binary soul is cloaked in a .json garment.
        if (await awtsmoosBinary.isAwtsmoosObject(buffer)) {
            return await awtsmoosBinary.deserializeBinary(buffer);
        }

        try {
            const text = buffer.toString("utf8");
            return JSON.parse(text);
        } catch (e) {
            // B"H: If the vessel refuses to be parsed as JSON, we do not shatter the process.
            // We return the raw matter (Buffer/String) so it may be evaluated by the Aliyah Policy.
            return buffer;
        }
    },
    "no_ext": async (fullPath) => {
        const buffer = await fs.readFile(fullPath);
        try {
            // Attempt to treat as Awtsmoos binary even if extension is missing
            if (await awtsmoosBinary.isAwtsmoosObject(buffer)) {
                return await awtsmoosBinary.deserializeBinary(buffer);
            }
            return buffer.toString("utf8");
        } catch (e) {
            return buffer; 
        }
    },
    "default": async (fullPath) => {
        const buffer = await fs.readFile(fullPath);
        try {
            return buffer.toString("utf8");
        } catch (e) {
            return buffer; 
        }
    }
};

class AwtsmoosContentExtractor {
    /**
     * @method extract
     * @description Frees the data from its physical shell.
     */
    static async extract(fullPath) {
        const ext = path.extname(fullPath);
        
        let strategy;
        if (!ext) {
            strategy = ExtractionStrategies["no_ext"];
        } else {
            strategy = ExtractionStrategies[ext] || ExtractionStrategies["default"];
        }
        
        try {
            return await strategy(fullPath);
        } catch (e) {
            throw new Error(`B"H: The letters refused to separate from the stone: ${e.message}`);
        }
    }
}

module.exports = AwtsmoosContentExtractor;
