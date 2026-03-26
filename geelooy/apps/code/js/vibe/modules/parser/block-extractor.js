
// B"H
/**
 * @file block-extractor.js
 * @brief The Sieve of Truth.
 * 
 * THE POEM OF THE EXTRACTOR:
 * Out of the noise, the raw block appears,
 * Wrapped in the markers, devoid of all fears.
 * We substitute CDATA to shield the raw byte,
 * Then parse it as XML, pulling the light.
 * If the operation is vague, if the intent is lost,
 * We assume it's a write, ignoring the cost.
 */

import { MARKERS } from './constants.js';
import { PathNormalizer } from './path-normalizer.js';

export const BlockExtractor = {
    /**
     * @function extract
     * @description Parses text blocks into structured change objects.
     * @param {string} text - The raw AI response.
     * @param {string} sessionRootPath - The anchor path.
     * @returns {Array<Object>} The structured changes.
     */
    extract(text, sessionRootPath) {
        if (!text) return [];
        
        // Transfigure Hebrew markers to standard CDATA to shield internal code containing < and >
        const oC = "<!" + "[C" + "DATA[";
        const cC = "]" + "]" + ">";
        const xmlReady = text.split(MARKERS.START).join(oC).split(MARKERS.END).join(cC);

        const changes = [];
        let lastIdx = 0;
        const domParser = new DOMParser();

        while (true) {
            const startIdx = xmlReady.indexOf(MARKERS.TAG_START, lastIdx);
            if (startIdx === -1) break;

            const endIdx = xmlReady.indexOf(MARKERS.TAG_END, startIdx);
            if (endIdx === -1) break;

            const block = xmlReady.substring(startIdx, endIdx + MARKERS.TAG_END.length);
            lastIdx = endIdx + MARKERS.TAG_END.length;

            try {
                const xmlDoc = domParser.parseFromString(block, "text/xml");
                const node = xmlDoc.querySelector(MARKERS.TAG_NAME);
                if (!node) continue;

                const fileLabel = node.querySelector(MARKERS.FILE_NAME)?.textContent?.trim();
                let operation = node.querySelector(MARKERS.OP_NAME)?.textContent?.trim().toLowerCase() || "write";
                const description = node.querySelector(MARKERS.DESC_NAME)?.textContent?.trim() || "";
                const content = node.querySelector(MARKERS.CONTENT_NAME)?.textContent || "";

                // B"H - The Grace of Interpretation
                // If the operation hallucinates (e.g. "update", "modify"), force it to 'write' if content exists.
                if (operation !== 'write' && operation !== 'delete') {
                    operation = content.trim().length > 0 ? 'write' : 'write';
                }

                if (fileLabel) {
                    const absolutePath = PathNormalizer.normalize(sessionRootPath, fileLabel);
                    
                    changes.push({
                        path: absolutePath,
                        sessionRootPath,
                        fileLabel,
                        operation,
                        content,
                        description
                    });
                }
            } catch(e) {
                console.warn("[BlockExtractor] B\"H - Block parsing encountered chaos:", e);
            }
        }
        
        return changes;
    }
};
