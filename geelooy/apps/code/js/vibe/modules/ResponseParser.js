
// B"H
/**
 * @file ResponseParser.js
 * @brief The Sieve of Divine Understanding with Hebrew CDATA transformation.
 */

export const ResponseParser = {
    START_MARKER: "₪₪₪_בס\"ד_תחי" + "לת_הק" + "וד_₪₪₪",
    END_MARKER: "₪₪₪_בס\"ד_ס" + "וף_הק" + "וד_₪₪₪",

    parseChanges(text, sessionRootPath) {
        if (!text) return [];
        
        // B"H - Transfigure the Hebrew markers into XML-safe CDATA blocks
        const oC = "<!" + "[C" + "DATA[";
        const cC = "]" + "]" + ">";
        
        // We must be careful to only replace markers that have a corresponding pair
        let processedText = text;
        if (text.includes(this.START_MARKER)) {
            processedText = text.split(this.START_MARKER).join(oC);
            if (processedText.includes(this.END_MARKER)) {
                processedText = processedText.split(this.END_MARKER).join(cC);
            } else {
                // If it's still streaming and hasn't reached the end, append a temporary closer
                processedText += cC;
            }
        }

        const changes = [];
        const tagS = "<chan" + "ge>";
        const tagE = "</c" + "hange>";
        
        let lastIdx = 0;
        const domParser = new DOMParser();

        while (true) {
            const startIdx = processedText.indexOf(tagS, lastIdx);
            if (startIdx === -1) break;

            const endIdx = processedText.indexOf(tagE, startIdx);
            if (endIdx === -1) break;

            const block = processedText.substring(startIdx, endIdx + tagE.length);
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
                }
            } catch(e) {
                console.warn("[ResponseParser] B\"H - Incremental block parse failed:", e);
            }
        }
        
        return changes;
    },

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
        return ('/' + finalSegs.join('/')).replace(/\/+/g, '/');
    }
};
