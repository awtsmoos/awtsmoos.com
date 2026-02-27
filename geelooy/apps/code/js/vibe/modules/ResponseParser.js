
// B"H
/**
 * @file ResponseParser.js
 * @brief The Sieve of Divine Understanding. Extracts XML blocks from AI speech.
 */

export const ResponseParser = {
    /** @constant {string} START_MARKER Hebrew start signal */
    START_MARKER: "₪₪₪_בס\"ד_תחי" + "לת_הק" + "וד_₪₪₪",
    /** @constant {string} END_MARKER Hebrew end signal */
    END_MARKER: "₪₪₪_בס\"ד_ס" + "וף_הק" + "וד_₪₪₪",

    /**
     * @function parseChanges
     * @description Extracts normalized changes from a block of text.
     */
    parseChanges(text, sessionRootPath) {
        if (!text) return [];
        
        // Transfigure markers to standard CDATA for internal DOM parsing
        const oC = "<!" + "[C" + "DATA[";
        const cC = "]" + "]" + ">";
        const xmlReady = text.split(this.START_MARKER).join(oC).split(this.END_MARKER).join(cC);

        const changes = [];
        const tagS = "<chan" + "ge>";
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
						sessionRootPath,
						fileLabel,
                        operation: operation.toLowerCase(),
                        content: content,
                        description: description
                    });
                }
            } catch(e) {
                console.warn("[ResponseParser] B\"H - Block parsing encountered chaos:", e);
            }
        }
        
        return changes;
    },

    /**
     * @private
     * @function _normalizePath
     * @description Ensures root and relative paths are woven into a single Absolute Path.
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
