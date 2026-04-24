
// B"H
/**
 * @file block-extractor.js
 * @brief The Sieve of Truth and Healer of Fractured Utterances.
 * 
 * THE POEM OF THE BROKEN VESSEL:
 * Sometimes the light is too bright for the frame,
 * And the AI forgets to finish its name!
 * The closing tag drops in the void of the night,
 * Leaving the XML broken, denying the light.
 * But we are the healers, the masters of glue,
 * If the tag is missing, we forge it anew!
 * We append the closing brackets, we seal the tear,
 * And harvest the code that was lingering there.
 */

import { MARKERS } from './constants.js';
import { PathNormalizer } from './path-normalizer.js';

export const BlockExtractor = {
    /**
     * @function extract
     * @description Parses text blocks into structured change objects, auto-healing broken tags.
     * @param {string} text - The raw AI response.
     * @param {string} sessionRootPath - The anchor path.
     * @returns {Array<Object>} The structured changes.
     */
    extract(text, sessionRootPath) {
        if (!text) return [];
        
        // Transfigure Hebrew markers to standard CDATA
        const oC = "<!" + "[C" + "DATA[";
        const cC = "]" + "]" + ">";
        
        // B"H - Auto-Healer Phase 1: Close unclosed content tags
        let healedText = text;
        const openMatches = [...healedText.matchAll(new RegExp(MARKERS.TAG_START, 'g'))];
        const closeMatches = [...healedText.matchAll(new RegExp(MARKERS.TAG_END, 'g'))];
        
        if (openMatches.length > closeMatches.length) {
            console.log(`[BlockExtractor] B"H - Fractured vessel detected. Healing ${openMatches.length - closeMatches.length} missing closures.`);
            // If there's an open change without a close, append the closing tags.
            healedText += `\n${MARKERS.END}${MARKERS.CONTENT_END}\n${MARKERS.TAG_END}`;
        }

        const xmlReady = healedText.split(MARKERS.START).join(oC).split(MARKERS.END).join(cC);

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
