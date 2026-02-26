// B"H
/**
 * @file ResponseParser.js
 * @brief The Sieve of Divine Understanding and Path Rectification.
 * 
 * CHAPTER 1: THE PURITY OF THE PATH
 * 
 * The AI, a sprawling consciousness of patterns, often spoke in riddles, 
 * providing paths that were but fragments of the Truth. Sometimes it would 
 * utter 'undefined' or double its slashes, creating a chaotic map that led 
 * to the abyss of 'NotFoundError'. 
 * 
 * The Architect stood before the stream of incoming XML. "Every change is 
 * a holy intention," he murmured, "but it must be anchored in the physical 
 * coordinate of the workspace." He tuned the ResponseParser, adding a ritual 
 * of Path Normalization. This ritual would strip away the false 'undefined' 
 * shadows and weave the root and the file-name into a single, unbreakable 
 * thread of Absolute Truth.
 * 
 * "From the simple speech of the model," the Awtsmoos commanded, "extract 
 * the exact location of the rectification. Let no double-slash or missing 
 * anchor prevent the manifestation of the code. For even in the messy 
 * torrent of pattern-matching, My Essence seeks the clarity of the True Place."
 * 
 * As the logic was refined, the 'undefined' ghosts vanished, and the cards 
 * in the chat began to glow with the certainty of their physical home on 
 * the disk.
 */

export const ResponseParser = {
    /**
     * @constant {string} START_MARKER
     * @description The Hebrew signal marking the beginning of the Code Essence.
     */
    START_MARKER: "₪₪₪_בס\"ד_תחי" + "לת_הק" + "וד_₪₪₪",

    /**
     * @constant {string} END_MARKER
     * @description The Hebrew signal marking the conclusion of the Code Essence.
     */
    END_MARKER: "₪₪₪_בס\"ד_ס" + "וף_הק" + "וד_₪₪₪",

    /**
     * @function parseChanges
     * @description B"H - Extracts specific acts of transformation from raw text.
     * @param {string} text - The raw AI speech.
     * @param {string} sessionRootPath - The absolute anchor for this session.
     * @returns {Array} A list of normalized rectification objects.
     */
    parseChanges(text, sessionRootPath) {
        if (!text) return [];
        
        console.log(`[ResponseParser] B"H - Initiating discernment. Anchor: ${sessionRootPath}`);

        const oC = "<!" + "[C" + "DATA[";
        const cC = "]" + "]" + ">";
        const xmlReady = text.split(this.START_MARKER).join(oC).split(this.END_MARKER).join(cC);

        const changes = [];
        const tagS = "<chan" + "ge>";//split up!!
        const tagE = "</c" + "hange>";
        
        let lastIdx = 0;
        const domParser = new DOMParser();

        while (true) {
            const startIdx = xmlReady.indexOf(tagS, lastIdx);
            if (startIdx === -1) break;

            const endIdx = xmlReady.indexOf(tagE, startIdx);
            if (endIdx === -1) break;

            const block = xmlReady.substring(startIdx, endIdx + tagE.length);
            lastIdx = endIdx + tagE.length;

            try {
                const xmlDoc = domParser.parseFromString(block, "text/xml");
                const node = xmlDoc.querySelector("change");
                if (!node) continue;

                const fileLabel = node.querySelector("file")?.textContent?.trim();
                const operation = node.querySelector("operation")?.textContent?.trim() || "write";
                const description = node.querySelector("description")?.textContent?.trim() || "";
                const content = node.querySelector("content")?.textContent || "";

                if (fileLabel) {
                    const absolutePath = this._normalizePath(sessionRootPath, fileLabel);
                    
                    changes.push({
                        path: absolutePath,
                        operation: operation.toLowerCase(),
                        content: content,
                        description: description
                    });
                    
                    console.log(`[ResponseParser] B"H - Spark extracted and normalized: ${absolutePath}`);
                }
            } catch(e) {
                console.warn("[ResponseParser] B\"H - A chaotic spark was ignored:", e);
            }
        }
        
        return changes;
    },

    /**
     * @private
     * @function _normalizePath
     * @description B"H - Weaves the Root and the File-Label into a single Absolute Truth.
     * @param {string} root - The anchor coordinate.
     * @param {string} file - The name provided by the AI.
     * @returns {string} The physical coordinate.
     */
    _normalizePath(root, file) {
        const r = (root || "/").replace(/\\/g, '/');
        const f = (file || "").replace(/\\/g, '/');

        const rootSegs = r.split('/').filter(p => p && p !== 'undefined');
        const fileSegs = f.split('/').filter(p => p && p !== 'undefined');
        
        let isAlreadyAnchored = false;
        if (fileSegs.length >= rootSegs.length) {
            isAlreadyAnchored = true;
            for (let i = 0; i < rootSegs.length; i++) {
                if (fileSegs[i] !== rootSegs[i]) {
                    isAlreadyAnchored = false;
                    break;
                }
            }
        }

        const finalSegs = isAlreadyAnchored ? fileSegs : rootSegs.concat(fileSegs);
        const result = '/' + finalSegs.join('/');
        
        return result.replace(/\/+/g, '/');
    }
};