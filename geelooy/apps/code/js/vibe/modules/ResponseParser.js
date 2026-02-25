
// B"H
// FILE: js/vibe/modules/ResponseParser.js

/**
 * @class ResponseParser
 * @description The organ of discernment. It takes the sprawling 
 * speech of the AI and extracts the specific acts of creation (changes).
 * It uses CDATA shielding to protect the code essence from the XML parser.
 */
export const ResponseParser = {
    START_MARKER: "₪₪₪_בס\"ד_תחילת_הקוד_₪₪₪",
    END_MARKER: "₪₪₪_בס\"ד_סוף_הקוד_₪₪₪",

    /**
     * @function parseChanges
     * @description B"H. Parses the AI response into a list of change objects.
     * @param {string} text The raw speech of the AI.
     * @param {string} rootPath The base path of the Vibe session.
     */
    parseChanges(text, rootPath) {
        if (!text) return [];
        
        // B"H - Convert Hebrew markers to XML CDATA to prevent parsing errors
        const oC = "<!" + "[C" + "DATA[";
        const cC = "]" + "]" + ">";
        const xmlReady = text.split(this.START_MARKER).join(oC).split(this.END_MARKER).join(cC);

        const changes = [];
        const tagS = "<change>";
        const tagE = "</change>";
        
        let lastIdx = 0;
        const parser = new DOMParser();

        while (true) {
            const startIdx = xmlReady.indexOf(tagS, lastIdx);
            if (startIdx === -1) break;

            const endIdx = xmlReady.indexOf(tagE, startIdx);
            if (endIdx === -1) break;

            const block = xmlReady.substring(startIdx, endIdx + tagE.length);
            lastIdx = endIdx + tagE.length;

            try {
                // Parse the individual block as valid XML
                const xmlDoc = parser.parseFromString(block, "text/xml");
                const node = xmlDoc.querySelector("change");
                if (!node) continue;

                const file = node.querySelector("file")?.textContent;
                const op = node.querySelector("operation")?.textContent || "write";
                const desc = node.querySelector("description")?.textContent || "";
                const content = node.querySelector("content")?.textContent || "";

                if (file) {
                    changes.push({
                        path: this._normalizePath(rootPath, file),
                        operation: op.toLowerCase().trim(),
                        content: content,
                        description: desc.trim()
                    });
                }
            } catch(e) {
                console.warn("B\"H - Block parsing failed:", e);
            }
        }
        
        return changes;
    },

    /**
     * @function _normalizePath
     * @description Ensures the path is absolute and correctly rooted in the workspace.
     */
    _normalizePath(root, file) {
        const r = root.replace(/\\/g, '/').split('/').filter(p => p);
        const f = file.replace(/\\/g, '/').split('/').filter(p => p);
        
        // Detect if the AI already provided an absolute path or just a relative one
        let isAbsolute = f.length >= r.length;
        if (isAbsolute) {
            for (let i = 0; i < r.length; i++) {
                if (f[i] !== r[i]) { isAbsolute = false; break; }
            }
        }

        const finalSegs = isAbsolute ? f : r.concat(f);
        return '/' + finalSegs.join('/');
    }
};
